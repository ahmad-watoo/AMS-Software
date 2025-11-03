import { supabaseAdmin } from '@/config/supabase';
import { logger } from '@/config/logger';

/**
 * Seed default roles and permissions for the system
 * Run this once to initialize the RBAC system
 */
export async function seedDefaultRolesAndPermissions(): Promise<void> {
  try {
    logger.info('Starting RBAC seed...');

    // Default roles with hierarchy levels
    const defaultRoles = [
      { name: 'super_admin', description: 'System Super Administrator', level: 10 },
      { name: 'admin', description: 'Institution Administrator', level: 9 },
      { name: 'registrar', description: 'Academic Registrar', level: 8 },
      { name: 'faculty', description: 'Teaching Faculty', level: 7 },
      { name: 'finance_officer', description: 'Finance Officer', level: 7 },
      { name: 'hr_manager', description: 'HR Manager', level: 7 },
      { name: 'librarian', description: 'Library Staff', level: 6 },
      { name: 'staff', description: 'General Staff', level: 6 },
      { name: 'student', description: 'Student', level: 5 },
      { name: 'parent', description: 'Parent/Guardian', level: 4 },
    ];

    // Insert roles
    logger.info('Inserting default roles...');
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .upsert(defaultRoles, { onConflict: 'name' })
      .select();

    if (rolesError) {
      throw rolesError;
    }

    logger.info(`Inserted ${roles?.length || 0} roles`);

    // Default permissions organized by module
    const defaultPermissions = [
      // Auth module
      { name: 'auth_login', module: 'auth', action: 'login', description: 'Login to system' },
      { name: 'auth_register', module: 'auth', action: 'register', description: 'Register new user' },
      { name: 'auth_view_profile', module: 'auth', action: 'view_profile', description: 'View own profile' },
      { name: 'auth_update_profile', module: 'auth', action: 'update_profile', description: 'Update own profile' },

      // User Management
      { name: 'user_create', module: 'user', action: 'create', description: 'Create users' },
      { name: 'user_read', module: 'user', action: 'read', description: 'View users' },
      { name: 'user_update', module: 'user', action: 'update', description: 'Update users' },
      { name: 'user_delete', module: 'user', action: 'delete', description: 'Delete users' },

      // Student Management
      { name: 'student_create', module: 'student', action: 'create', description: 'Create students' },
      { name: 'student_read', module: 'student', action: 'read', description: 'View students' },
      { name: 'student_update', module: 'student', action: 'update', description: 'Update students' },
      { name: 'student_delete', module: 'student', action: 'delete', description: 'Delete students' },
      { name: 'student_view_all', module: 'student', action: 'view_all', description: 'View all students' },

      // Admission
      { name: 'admission_view', module: 'admission', action: 'view', description: 'View admissions' },
      { name: 'admission_create', module: 'admission', action: 'create', description: 'Create admission applications' },
      { name: 'admission_approve', module: 'admission', action: 'approve', description: 'Approve admissions' },
      { name: 'admission_reject', module: 'admission', action: 'reject', description: 'Reject admissions' },

      // Course Management
      { name: 'course_create', module: 'course', action: 'create', description: 'Create courses' },
      { name: 'course_read', module: 'course', action: 'read', description: 'View courses' },
      { name: 'course_update', module: 'course', action: 'update', description: 'Update courses' },
      { name: 'course_delete', module: 'course', action: 'delete', description: 'Delete courses' },

      // Enrollment
      { name: 'enrollment_create', module: 'enrollment', action: 'create', description: 'Register for courses' },
      { name: 'enrollment_read', module: 'enrollment', action: 'read', description: 'View enrollments' },
      { name: 'enrollment_approve', module: 'enrollment', action: 'approve', description: 'Approve enrollments' },

      // Exam Management
      { name: 'exam_create', module: 'exam', action: 'create', description: 'Create exams' },
      { name: 'exam_read', module: 'exam', action: 'read', description: 'View exams' },
      { name: 'exam_grade', module: 'exam', action: 'grade', description: 'Grade exams' },
      { name: 'exam_publish', module: 'exam', action: 'publish', description: 'Publish results' },

      // Attendance
      { name: 'attendance_mark', module: 'attendance', action: 'mark', description: 'Mark attendance' },
      { name: 'attendance_read', module: 'attendance', action: 'read', description: 'View attendance' },
      { name: 'attendance_report', module: 'attendance', action: 'report', description: 'View attendance reports' },

      // Finance
      { name: 'finance_read', module: 'finance', action: 'read', description: 'View financial data' },
      { name: 'finance_create', module: 'finance', action: 'create', description: 'Create financial records' },
      { name: 'finance_payment', module: 'finance', action: 'payment', description: 'Process payments' },
      { name: 'finance_report', module: 'finance', action: 'report', description: 'View financial reports' },

      // Library
      { name: 'library_borrow', module: 'library', action: 'borrow', description: 'Borrow books' },
      { name: 'library_return', module: 'library', action: 'return', description: 'Return books' },
      { name: 'library_manage', module: 'library', action: 'manage', description: 'Manage library catalog' },

      // RBAC
      { name: 'rbac_manage_roles', module: 'rbac', action: 'manage_roles', description: 'Manage roles' },
      { name: 'rbac_manage_permissions', module: 'rbac', action: 'manage_permissions', description: 'Manage permissions' },
      { name: 'rbac_assign_roles', module: 'rbac', action: 'assign_roles', description: 'Assign roles to users' },
    ];

    // Insert permissions
    logger.info('Inserting default permissions...');
    const { data: permissions, error: permsError } = await supabaseAdmin
      .from('permissions')
      .upsert(defaultPermissions, { onConflict: 'name' })
      .select();

    if (permsError) {
      throw permsError;
    }

    logger.info(`Inserted ${permissions?.length || 0} permissions`);

    // Assign permissions to roles (example: super_admin gets all permissions)
    if (roles && permissions) {
      const superAdminRole = roles.find((r: any) => r.name === 'super_admin');
      if (superAdminRole) {
        logger.info('Assigning all permissions to super_admin...');
        const rolePermissions = permissions.map((perm: any) => ({
          role_id: superAdminRole.id,
          permission_id: perm.id,
        }));

        await supabaseAdmin.from('role_permissions').upsert(rolePermissions, { onConflict: 'role_id,permission_id' });
        logger.info(`Assigned ${permissions.length} permissions to super_admin`);
      }
    }

    logger.info('RBAC seed completed successfully!');
  } catch (error) {
    logger.error('Error seeding RBAC:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDefaultRolesAndPermissions()
    .then(() => {
      console.log('Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

