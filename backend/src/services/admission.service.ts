/**
 * Admission Service
 * 
 * This service handles all admission management business logic including:
 * - Application CRUD operations
 * - Eligibility checking and scoring
 * - Merit list generation
 * - Application status management
 * - Document management
 * 
 * The admission process follows these steps:
 * 1. Application submission
 * 2. Eligibility check (minimum marks/CGPA, age limits, required subjects)
 * 3. Merit scoring (academic history + test scores)
 * 4. Merit list generation (ranked by score)
 * 5. Selection/waitlisting based on available seats
 * 
 * @module services/admission.service
 */

import { AdmissionRepository } from '@/repositories/admission.repository';
import {
  AdmissionApplication,
  AdmissionDocument,
  EligibilityCriteria,
  CreateApplicationDTO,
  UpdateApplicationDTO,
  EligibilityCheckDTO,
  MeritListGenerateDTO,
} from '@/models/Admission.model';
import { NotFoundError, ValidationError, ConflictError } from '@/utils/errors';
import { logger } from '@/config/logger';

export class AdmissionService {
  private admissionRepository: AdmissionRepository;

  constructor() {
    this.admissionRepository = new AdmissionRepository();
  }

  /**
   * Get all applications with pagination and filters
   * 
   * Retrieves applications with optional filtering by program, status, batch,
   * and search query. Returns paginated results.
   * 
   * @param {number} [limit=50] - Maximum number of applications to return
   * @param {number} [offset=0] - Number of applications to skip
   * @param {Object} [filters] - Optional filter criteria
   * @param {string} [filters.programId] - Filter by program ID
   * @param {string} [filters.status] - Filter by application status
   * @param {string} [filters.batch] - Filter by batch
   * @param {string} [filters.search] - Search by application number
   * @returns {Promise<{applications: AdmissionApplication[], total: number}>} Applications and total count
   * 
   * @example
   * const { applications, total } = await admissionService.getAllApplications(20, 0, {
   *   programId: 'prog123',
   *   status: 'eligible',
   *   search: 'APP-2024'
   * });
   */
  async getAllApplications(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      programId?: string;
      status?: string;
      batch?: string;
      search?: string;
    }
  ): Promise<{
    applications: AdmissionApplication[];
    total: number;
  }> {
    try {
      // Get all applications (for filtering)
      // TODO: Move filtering to database level for better performance
      const allApplications = await this.admissionRepository.findAllApplications(limit * 10, 0, {
        programId: filters?.programId,
        status: filters?.status,
        batch: filters?.batch,
      });

      let filteredApplications = allApplications;

      // Apply search filter if provided (by application number)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredApplications = allApplications.filter(
          (app) =>
            app.applicationNumber.toLowerCase().includes(searchLower)
        );
      }

      // Apply pagination
      const paginatedApplications = filteredApplications.slice(offset, offset + limit);

      return {
        applications: paginatedApplications,
        total: filteredApplications.length,
      };
    } catch (error) {
      logger.error('Error getting all applications:', error);
      throw new Error('Failed to fetch applications');
    }
  }

  /**
   * Get application by ID
   * 
   * Retrieves a specific application by its ID with full details
   * including user and program information.
   * 
   * @param {string} id - Application ID
   * @returns {Promise<any>} Application with full details
   * @throws {NotFoundError} If application not found
   */
  async getApplicationById(id: string): Promise<any> {
    try {
      return await this.admissionRepository.getApplicationWithDetails(id);
    } catch (error) {
      logger.error('Error getting application by ID:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new Error('Failed to fetch application');
    }
  }

  /**
   * Get user applications
   * 
   * Retrieves all applications submitted by a specific user.
   * 
   * @param {string} userId - User ID
   * @returns {Promise<AdmissionApplication[]>} Array of user's applications
   * 
   * @example
   * const applications = await admissionService.getUserApplications('user123');
   */
  async getUserApplications(userId: string): Promise<AdmissionApplication[]> {
    try {
      return await this.admissionRepository.findApplicationsByUserId(userId);
    } catch (error) {
      logger.error('Error getting user applications:', error);
      throw new Error('Failed to fetch user applications');
    }
  }

  /**
   * Create a new application
   * 
   * Creates a new admission application with validation.
   * Prevents duplicate active applications for the same program.
   * 
   * @param {CreateApplicationDTO} applicationData - Application creation data
   * @returns {Promise<AdmissionApplication>} Created application
   * @throws {ValidationError} If required fields are missing
   * @throws {ConflictError} If user already has an active application
   * 
   * @example
   * const application = await admissionService.createApplication({
   *   userId: 'user123',
   *   programId: 'prog456',
   *   documents: [
   *     { documentType: 'matric', documentName: 'Matric Certificate', documentUrl: '...' }
   *   ]
   * });
   */
  async createApplication(applicationData: CreateApplicationDTO): Promise<AdmissionApplication> {
    try {
      // Validate required fields
      if (!applicationData.userId || !applicationData.programId) {
        throw new ValidationError('userId and programId are required');
      }

      // Check if user already has an active application for this program
      const existingApplications = await this.admissionRepository.findApplicationsByUserId(applicationData.userId);
      const activeApplication = existingApplications.find(
        (app) =>
          app.programId === applicationData.programId &&
          ['submitted', 'under_review', 'eligible', 'selected', 'waitlisted'].includes(app.status)
      );

      if (activeApplication) {
        throw new ConflictError('You already have an active application for this program');
      }

      // Create application
      const application = await this.admissionRepository.createApplication(applicationData);

      // Create documents if provided
      if (applicationData.documents && applicationData.documents.length > 0) {
        await Promise.all(
          applicationData.documents.map((doc) =>
            this.admissionRepository.createDocument({
              applicationId: application.id,
              documentType: doc.documentType as any,
              documentName: doc.documentName,
              documentUrl: doc.documentUrl,
            })
          )
        );
      }

      return application;
    } catch (error) {
      logger.error('Error creating application:', error);
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      throw new Error('Failed to create application');
    }
  }

  /**
   * Update an application
   * 
   * Updates an existing application's information.
   * 
   * @param {string} id - Application ID
   * @param {UpdateApplicationDTO} applicationData - Partial application data to update
   * @returns {Promise<AdmissionApplication>} Updated application
   */
  async updateApplication(id: string, applicationData: UpdateApplicationDTO): Promise<AdmissionApplication> {
    try {
      return await this.admissionRepository.updateApplication(id, applicationData);
    } catch (error) {
      logger.error('Error updating application:', error);
      throw new Error('Failed to update application');
    }
  }

  /**
   * Check application eligibility
   * 
   * Checks if an application meets the eligibility criteria for a program.
   * Evaluates minimum marks/CGPA, age limits, required subjects, and test scores.
   * 
   * Scoring system:
   * - Base score: 50 points (if minimum marks requirement met)
   * - Entry test: 30% weightage (if provided)
   * - Interview: 20% weightage (if provided)
   * 
   * @param {EligibilityCheckDTO} checkData - Eligibility check data
   * @returns {Promise<{eligible: boolean, score: number, criteria: EligibilityCriteria | null, reasons: string[]}>}
   * Eligibility result with score and reasons
   * 
   * @example
   * const result = await admissionService.checkEligibility({
   *   applicationId: 'app123',
   *   programId: 'prog456',
   *   academicHistory: [
   *     { degree: 'BS', marks: 85, cgpa: 3.4, year: 2024 }
   *   ],
   *   testScores: {
   *     entryTest: 75,
   *     interview: 80
   *   }
   * });
   */
  async checkEligibility(checkData: EligibilityCheckDTO): Promise<{
    eligible: boolean;
    score: number;
    criteria: EligibilityCriteria | null;
    reasons: string[];
  }> {
    try {
      // Get eligibility criteria for the program
      const criteria = await this.admissionRepository.getEligibilityCriteria(checkData.programId);

      if (!criteria) {
        return {
          eligible: false,
          score: 0,
          criteria: null,
          reasons: ['Eligibility criteria not found for this program'],
        };
      }

      let score = 0;
      const reasons: string[] = [];
      let isEligible = true;

      // Check minimum marks/CGPA
      const latestQualification = checkData.academicHistory[checkData.academicHistory.length - 1];
      const marks = latestQualification.marks || (latestQualification.cgpa ? latestQualification.cgpa * 25 : 0);

      if (criteria.minimumMarks && marks < criteria.minimumMarks) {
        isEligible = false;
        reasons.push(`Marks ${marks}% is below minimum required ${criteria.minimumMarks}%`);
      } else {
        score += 50; // Base score for meeting minimum marks
      }

      if (criteria.minimumCGPA && latestQualification.cgpa && latestQualification.cgpa < criteria.minimumCGPA) {
        isEligible = false;
        reasons.push(`CGPA ${latestQualification.cgpa} is below minimum required ${criteria.minimumCGPA}`);
      }

      // Check required subjects (if applicable)
      if (criteria.requiredSubjects && criteria.requiredSubjects.length > 0) {
        // TODO: Check against actual subject data from academic history
        // For now, we'll assume it passes if criteria exists
      }

      // Check age limit (if applicable)
      if (criteria.ageLimit) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - latestQualification.year;
        if (age > criteria.ageLimit) {
          isEligible = false;
          reasons.push(`Age exceeds maximum limit of ${criteria.ageLimit} years`);
        }
      }

      // Add test scores if provided
      if (checkData.testScores?.entryTest) {
        score += (checkData.testScores.entryTest / 100) * 30; // 30% weightage
      }

      if (checkData.testScores?.interview) {
        score += (checkData.testScores.interview / 100) * 20; // 20% weightage
      }

      // Update application eligibility status
      const application = await this.admissionRepository.findApplicationById(checkData.applicationId);
      if (application) {
        await this.admissionRepository.updateApplication(checkData.applicationId, {
          eligibilityStatus: isEligible ? 'eligible' : 'not_eligible',
          eligibilityScore: score,
        });
      }

      return {
        eligible: isEligible,
        score,
        criteria,
        reasons,
      };
    } catch (error) {
      logger.error('Error checking eligibility:', error);
      throw new Error('Failed to check eligibility');
    }
  }

  /**
   * Generate merit list
   * 
   * Generates a merit list for a program based on eligibility scores.
   * Ranks applications by merit score and assigns selection/waitlist status.
   * 
   * Process:
   * 1. Get all eligible applications for the program
   * 2. Calculate merit scores (from eligibility scores)
   * 3. Sort by merit score (descending)
   * 4. Assign ranks
   * 5. Mark as 'selected' (top N) or 'waitlisted' (remaining)
   * 6. Update application statuses and merit ranks
   * 
   * @param {MeritListGenerateDTO} generateData - Merit list generation data
   * @returns {Promise<MeritList>} Generated merit list with ranked applications
   * 
   * @example
   * const meritList = await admissionService.generateMeritList({
   *   programId: 'prog456',
   *   batch: '2024-Fall',
   *   semester: 'Fall',
   *   totalSeats: 50
   * });
   */
  async generateMeritList(generateData: MeritListGenerateDTO): Promise<MeritList> {
    try {
      // Get all eligible applications for the program
      const applications = await this.admissionRepository.findAllApplications(1000, 0, {
        programId: generateData.programId,
        status: 'eligible',
      });

      // Calculate merit scores for each application
      const applicationsWithScores = await Promise.all(
        applications.map(async (app) => {
          const details = await this.admissionRepository.getApplicationWithDetails(app.id);
          const meritScore = app.eligibilityScore || 0;

          return {
            applicationId: app.id,
            applicationNumber: app.applicationNumber,
            applicantName: details.users
              ? `${details.users.first_name} ${details.users.last_name}`
              : 'Unknown',
            meritScore,
          };
        })
      );

      // Sort by merit score (descending)
      applicationsWithScores.sort((a, b) => b.meritScore - a.meritScore);

      // Assign ranks and status
      const meritApplications = applicationsWithScores.map((app, index) => ({
        applicationId: app.applicationId,
        applicationNumber: app.applicationNumber,
        applicantName: app.applicantName,
        meritScore: app.meritScore,
        rank: index + 1,
        status: index + 1 <= generateData.totalSeats ? 'selected' : 'waitlisted' as const,
      }));

      // Update application statuses
      for (const meritApp of meritApplications) {
        await this.admissionRepository.updateApplicationStatus(
          meritApp.applicationId,
          meritApp.status === 'selected' ? 'selected' : 'waitlisted',
          'system'
        );
        await this.admissionRepository.updateApplication(meritApp.applicationId, {
          meritRank: meritApp.rank,
        });
      }

      // Create merit list record
      const meritList: MeritList = {
        id: '', // Will be generated by database
        programId: generateData.programId,
        batch: generateData.batch,
        semester: generateData.semester,
        publishedDate: new Date().toISOString(),
        totalSeats: generateData.totalSeats,
        applications: meritApplications,
        createdAt: new Date().toISOString(),
      };

      // TODO: Save merit list to database
      // For now, we'll return the calculated merit list

      return meritList;
    } catch (error) {
      logger.error('Error generating merit list:', error);
      throw new Error('Failed to generate merit list');
    }
  }

  /**
   * Get application documents
   * 
   * Retrieves all documents uploaded for an application.
   * 
   * @param {string} applicationId - Application ID
   * @returns {Promise<AdmissionDocument[]>} Array of application documents
   */
  async getApplicationDocuments(applicationId: string): Promise<AdmissionDocument[]> {
    try {
      return await this.admissionRepository.getApplicationDocuments(applicationId);
    } catch (error) {
      logger.error('Error getting application documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  /**
   * Update application status
   * 
   * Updates the status of an application (e.g., 'selected', 'rejected', 'enrolled').
   * 
   * @param {string} id - Application ID
   * @param {AdmissionApplication['status']} status - New status
   * @param {string} [reviewedBy] - ID of user who reviewed the application
   * @returns {Promise<void>}
   */
  async updateApplicationStatus(
    id: string,
    status: AdmissionApplication['status'],
    reviewedBy?: string
  ): Promise<void> {
    try {
      await this.admissionRepository.updateApplicationStatus(id, status, reviewedBy);
    } catch (error) {
      logger.error('Error updating application status:', error);
      throw new Error('Failed to update application status');
    }
  }
}
