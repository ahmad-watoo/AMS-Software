import { supabaseAdmin } from '@/config/supabase';
import {
  Timetable,
  Room,
  Building,
  CreateTimetableDTO,
  UpdateTimetableDTO,
  CreateRoomDTO,
  UpdateRoomDTO,
  CreateBuildingDTO,
} from '@/models/Timetable.model';
import { logger } from '@/config/logger';

export class TimetableRepository {
  private timetablesTable = 'timetables';
  private roomsTable = 'rooms';
  private buildingsTable = 'buildings';

  // ==================== Timetables ====================

  async findAllTimetables(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      sectionId?: string;
      facultyId?: string;
      semester?: string;
      dayOfWeek?: number;
      roomId?: string;
    }
  ): Promise<Timetable[]> {
    try {
      let query = supabaseAdmin
        .from(this.timetablesTable)
        .select('*')
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.sectionId) {
        query = query.eq('section_id', filters.sectionId);
      }
      if (filters?.facultyId) {
        query = query.eq('faculty_id', filters.facultyId);
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.dayOfWeek) {
        query = query.eq('day_of_week', filters.dayOfWeek);
      }
      if (filters?.roomId) {
        query = query.eq('room_id', filters.roomId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapTimetableFromDB) as Timetable[];
    } catch (error) {
      logger.error('Error finding all timetables:', error);
      throw new Error('Failed to fetch timetables');
    }
  }

  async findTimetableById(id: string): Promise<Timetable | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.timetablesTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapTimetableFromDB(data) as Timetable;
    } catch (error) {
      logger.error('Error finding timetable by ID:', error);
      throw error;
    }
  }

  async createTimetable(timetableData: CreateTimetableDTO): Promise<Timetable> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.timetablesTable)
        .insert({
          section_id: timetableData.sectionId,
          day_of_week: timetableData.dayOfWeek,
          start_time: timetableData.startTime,
          end_time: timetableData.endTime,
          room_id: timetableData.roomId || null,
          faculty_id: timetableData.facultyId || null,
          semester: timetableData.semester,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapTimetableFromDB(data) as Timetable;
    } catch (error) {
      logger.error('Error creating timetable:', error);
      throw new Error('Failed to create timetable');
    }
  }

  async updateTimetable(id: string, timetableData: UpdateTimetableDTO): Promise<Timetable> {
    try {
      const updateData: any = {};

      if (timetableData.dayOfWeek !== undefined) updateData.day_of_week = timetableData.dayOfWeek;
      if (timetableData.startTime !== undefined) updateData.start_time = timetableData.startTime;
      if (timetableData.endTime !== undefined) updateData.end_time = timetableData.endTime;
      if (timetableData.roomId !== undefined) updateData.room_id = timetableData.roomId;
      if (timetableData.facultyId !== undefined) updateData.faculty_id = timetableData.facultyId;

      const { data, error } = await supabaseAdmin
        .from(this.timetablesTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapTimetableFromDB(data) as Timetable;
    } catch (error) {
      logger.error('Error updating timetable:', error);
      throw new Error('Failed to update timetable');
    }
  }

  async deleteTimetable(id: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin
        .from(this.timetablesTable)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error deleting timetable:', error);
      throw new Error('Failed to delete timetable');
    }
  }

  async checkTimeConflict(
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    semester: string,
    excludeId?: string
  ): Promise<Timetable[]> {
    try {
      let query = supabaseAdmin
        .from(this.timetablesTable)
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .eq('semester', semester)
        .or(`start_time.lte.${endTime},end_time.gte.${startTime}`);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapTimetableFromDB) as Timetable[];
    } catch (error) {
      logger.error('Error checking time conflict:', error);
      throw new Error('Failed to check time conflict');
    }
  }

  // ==================== Rooms ====================

  async findAllRooms(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      buildingId?: string;
      roomType?: string;
      isActive?: boolean;
    }
  ): Promise<Room[]> {
    try {
      let query = supabaseAdmin
        .from(this.roomsTable)
        .select('*')
        .order('room_number', { ascending: true })
        .range(offset, offset + limit - 1);

      if (filters?.buildingId) {
        query = query.eq('building_id', filters.buildingId);
      }
      if (filters?.roomType) {
        query = query.eq('room_type', filters.roomType);
      }
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapRoomFromDB) as Room[];
    } catch (error) {
      logger.error('Error finding all rooms:', error);
      throw new Error('Failed to fetch rooms');
    }
  }

  async findRoomById(id: string): Promise<Room | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.roomsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapRoomFromDB(data) as Room;
    } catch (error) {
      logger.error('Error finding room by ID:', error);
      throw error;
    }
  }

  async createRoom(roomData: CreateRoomDTO): Promise<Room> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.roomsTable)
        .insert({
          room_number: roomData.roomNumber,
          building_id: roomData.buildingId || null,
          room_type: roomData.roomType,
          capacity: roomData.capacity || null,
          facilities: roomData.facilities || [],
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapRoomFromDB(data) as Room;
    } catch (error) {
      logger.error('Error creating room:', error);
      throw new Error('Failed to create room');
    }
  }

  async updateRoom(id: string, roomData: UpdateRoomDTO): Promise<Room> {
    try {
      const updateData: any = {};

      if (roomData.roomNumber !== undefined) updateData.room_number = roomData.roomNumber;
      if (roomData.buildingId !== undefined) updateData.building_id = roomData.buildingId;
      if (roomData.roomType !== undefined) updateData.room_type = roomData.roomType;
      if (roomData.capacity !== undefined) updateData.capacity = roomData.capacity;
      if (roomData.facilities !== undefined) updateData.facilities = roomData.facilities;
      if (roomData.isActive !== undefined) updateData.is_active = roomData.isActive;

      const { data, error } = await supabaseAdmin
        .from(this.roomsTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapRoomFromDB(data) as Room;
    } catch (error) {
      logger.error('Error updating room:', error);
      throw new Error('Failed to update room');
    }
  }

  // ==================== Buildings ====================

  async findAllBuildings(limit: number = 50, offset: number = 0): Promise<Building[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.buildingsTable)
        .select('*')
        .order('name', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapBuildingFromDB) as Building[];
    } catch (error) {
      logger.error('Error finding all buildings:', error);
      throw new Error('Failed to fetch buildings');
    }
  }

  async findBuildingById(id: string): Promise<Building | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.buildingsTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapBuildingFromDB(data) as Building;
    } catch (error) {
      logger.error('Error finding building by ID:', error);
      throw error;
    }
  }

  async createBuilding(buildingData: CreateBuildingDTO): Promise<Building> {
    try {
      const { data, error } = await supabaseAdmin
        .from(this.buildingsTable)
        .insert({
          name: buildingData.name,
          code: buildingData.code,
          campus_id: buildingData.campusId || null,
          floors: buildingData.floors || null,
          address: buildingData.address || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapBuildingFromDB(data) as Building;
    } catch (error) {
      logger.error('Error creating building:', error);
      throw new Error('Failed to create building');
    }
  }

  // ==================== Helper Mappers ====================

  private mapTimetableFromDB(data: any): Partial<Timetable> {
    return {
      id: data.id,
      sectionId: data.section_id,
      dayOfWeek: data.day_of_week,
      startTime: data.start_time,
      endTime: data.end_time,
      roomId: data.room_id,
      facultyId: data.faculty_id,
      semester: data.semester,
      createdAt: data.created_at,
    };
  }

  private mapRoomFromDB(data: any): Partial<Room> {
    return {
      id: data.id,
      roomNumber: data.room_number,
      buildingId: data.building_id,
      roomType: data.room_type,
      capacity: data.capacity,
      facilities: data.facilities || [],
      isActive: data.is_active,
      createdAt: data.created_at,
    };
  }

  private mapBuildingFromDB(data: any): Partial<Building> {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      campusId: data.campus_id,
      floors: data.floors,
      address: data.address,
      createdAt: data.created_at,
    };
  }
}

