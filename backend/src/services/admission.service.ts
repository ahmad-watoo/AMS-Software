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
      const allApplications = await this.admissionRepository.findAllApplications(limit * 10, 0, {
        programId: filters?.programId,
        status: filters?.status,
        batch: filters?.batch,
      });

      let filteredApplications = allApplications;

      // Apply search filter if provided
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

  async getUserApplications(userId: string): Promise<AdmissionApplication[]> {
    try {
      return await this.admissionRepository.findApplicationsByUserId(userId);
    } catch (error) {
      logger.error('Error getting user applications:', error);
      throw new Error('Failed to fetch user applications');
    }
  }

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

  async updateApplication(id: string, applicationData: UpdateApplicationDTO): Promise<AdmissionApplication> {
    try {
      return await this.admissionRepository.updateApplication(id, applicationData);
    } catch (error) {
      logger.error('Error updating application:', error);
      throw new Error('Failed to update application');
    }
  }

  async checkEligibility(checkData: EligibilityCheckDTO): Promise<{
    eligible: boolean;
    score: number;
    criteria: EligibilityCriteria | null;
    reasons: string[];
  }> {
    try {
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
        // This would need to be checked against actual subject data
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

      // Note: This would need to be saved to database
      // For now, we'll return the calculated merit list

      return meritList;
    } catch (error) {
      logger.error('Error generating merit list:', error);
      throw new Error('Failed to generate merit list');
    }
  }

  async getApplicationDocuments(applicationId: string): Promise<AdmissionDocument[]> {
    try {
      return await this.admissionRepository.getApplicationDocuments(applicationId);
    } catch (error) {
      logger.error('Error getting application documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

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

