-- Fix infinite recursion in user_roles RLS policies
-- The issue: policies were checking user_roles while inserting into user_roles

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their own organization roles" ON user_roles;
DROP POLICY IF EXISTS "Users can be added to organizations by admins" ON user_roles;
DROP POLICY IF EXISTS "Users can update roles in their orgs" ON user_roles;
DROP POLICY IF EXISTS "Users can remove roles in their orgs" ON user_roles;

-- Create new safer policies that don't cause recursion

-- Allow users to view their own roles (safe read)
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Allow inserting user_roles if:
-- 1. It's the user adding themselves (for organization creation)
-- 2. OR it's an admin of the target organization
CREATE POLICY "Allow user role creation" ON user_roles
  FOR INSERT WITH CHECK (
    -- Allow users to add themselves when creating organizations
    user_id = auth.uid()
    -- OR allow existing org admins to add others
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = organization_id
      AND r.name IN ('owner', 'admin')
    )
  );

-- Allow updating roles only by org admins
CREATE POLICY "Allow role updates by admins" ON user_roles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = organization_id
      AND r.name IN ('owner', 'admin')
    )
  );

-- Allow deleting roles by admins or users removing themselves
CREATE POLICY "Allow role deletion" ON user_roles
  FOR DELETE USING (
    user_id = auth.uid() -- Users can remove themselves
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND ur.organization_id = organization_id
      AND r.name IN ('owner', 'admin')
    )
  );

-- Also ensure organizations table allows creation by authenticated users
-- Drop and recreate organization policies to be safer
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Admins can update organizations" ON organizations;
DROP POLICY IF EXISTS "Owners can delete organizations" ON organizations;

-- Organizations policies (no recursion)
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

-- Allow any authenticated user to create organizations (they'll be made owner via trigger)
CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update their organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT ur.organization_id FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners can delete their organizations" ON organizations
  FOR DELETE USING (
    id IN (
      SELECT ur.organization_id FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'owner'
    )
  );