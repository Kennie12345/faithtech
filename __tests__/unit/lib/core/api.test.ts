import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  mockUser,
  mockCity,
  mockProfile,
  mockUserCityRole,
} from '@/__tests__/helpers/mocks';

// Mock the Supabase server client BEFORE importing the module that uses it
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Import after mocking
import {
  getUser,
  getUserProfile,
  updateUserProfile,
  getUserRole,
  isAdmin,
  isSuperAdmin,
  getCurrentCityId,
  setCityContext,
  getCurrentCity,
  getCity,
  getCityBySlug,
  getAllCities,
  updateCity,
  createCity,
  getUserCities,
  addUserToCity,
  getGroups,
  getGroupMembers,
} from '@/lib/core/api';

describe('CoreAPI - User & Authentication', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockResolvedValue(mockClient);
  });

  describe('getUser()', () => {
    it('should return user when authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getUser();

      expect(result).toEqual(mockUser);
      expect(mockClient.auth.getUser).toHaveBeenCalledOnce();
    });

    it('should return null when not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUser();

      expect(result).toBeNull();
    });

    it('should return null on auth error', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Unauthorized', name: 'AuthError', status: 401 },
      });

      const result = await getUser();

      expect(result).toBeNull();
    });
  });

  describe('getUserProfile()', () => {
    it('should get current user profile when no userId provided', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const singleMock = vi.fn().mockResolvedValue(createSuccessResponse(mockProfile));
      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      } as any);

      const result = await getUserProfile();

      expect(result).toEqual(mockProfile);
      expect(mockClient.from).toHaveBeenCalledWith('profiles');
    });

    it('should get specific user profile when userId provided', async () => {
      const specificUserId = 'user-123';
      const singleMock = vi.fn().mockResolvedValue(createSuccessResponse(mockProfile));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      } as any);

      const result = await getUserProfile(specificUserId);

      expect(result).toEqual(mockProfile);
    });

    it('should return null when no user is authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUserProfile();

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const singleMock = vi.fn().mockResolvedValue(
        createErrorResponse('Profile not found')
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: singleMock,
          }),
        }),
      } as any);

      const result = await getUserProfile();

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile()', () => {
    it('should update own profile', async () => {
      const updates = { display_name: 'Updated Name', bio: 'New bio' };
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse({ ...mockProfile, ...updates })
      );

      mockClient.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await updateUserProfile(mockUser.id, updates);

      expect(result).toMatchObject(updates);
      expect(mockClient.from).toHaveBeenCalledWith('profiles');
    });

    it('should not update other user profile as non-admin', async () => {
      const otherUserId = 'other-user-id';
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock isAdmin to return false (via getUserRole)
      const roleQuery = vi.fn().mockResolvedValue(createSuccessResponse({ role: 'member' }));
      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: roleQuery,
          }),
        }),
      } as any);

      const result = await updateUserProfile(otherUserId, { display_name: 'Hacker' });

      expect(result).toBeNull();
    });

    it('should return null when not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await updateUserProfile(mockUser.id, { display_name: 'Updated' });

      expect(result).toBeNull();
    });
  });
});

describe('CoreAPI - Authorization & Roles', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockResolvedValue(mockClient);
  });

  describe('getUserRole()', () => {
    it('should return user role in city', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock getCurrentCityId via rpc
      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      // Mock getUserRole query
      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse({ role: 'city_admin' })
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await getUserRole(mockCity.id);

      expect(result).toBe('city_admin');
    });

    it('should return null when user not in city', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const singleMock = vi.fn().mockResolvedValue(
        createErrorResponse('Not found', 'PGRST116')
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await getUserRole(mockCity.id);

      expect(result).toBeNull();
    });

    it('should return null when not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUserRole(mockCity.id);

      expect(result).toBeNull();
    });
  });

  describe('isAdmin()', () => {
    it('should return true for city_admin', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse({ role: 'city_admin' })
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await isAdmin(mockCity.id);

      expect(result).toBe(true);
    });

    it('should return true for super_admin', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse({ role: 'super_admin' })
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await isAdmin(mockCity.id);

      expect(result).toBe(true);
    });

    it('should return false for member', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse({ role: 'member' })
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await isAdmin(mockCity.id);

      expect(result).toBe(false);
    });
  });

  describe('isSuperAdmin()', () => {
    it('should return true when user has super_admin role', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const limitMock = vi.fn().mockResolvedValue(
        createSuccessResponse([{ role: 'super_admin' }])
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: limitMock,
            }),
          }),
        }),
      } as any);

      const result = await isSuperAdmin();

      expect(result).toBe(true);
    });

    it('should return false when user has no super_admin role', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const limitMock = vi.fn().mockResolvedValue(createSuccessResponse([]));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: limitMock,
            }),
          }),
        }),
      } as any);

      const result = await isSuperAdmin();

      expect(result).toBe(false);
    });

    it('should return false when not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await isSuperAdmin();

      expect(result).toBe(false);
    });
  });
});

describe('CoreAPI - City Context', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockResolvedValue(mockClient);
  });

  describe('getCurrentCityId()', () => {
    it('should return current city ID from context', async () => {
      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const result = await getCurrentCityId();

      expect(result).toBe(mockCity.id);
      expect(mockClient.rpc).toHaveBeenCalledWith('current_city');
    });

    it('should return null when no city context set', async () => {
      mockClient.rpc.mockResolvedValue(createSuccessResponse(null));

      const result = await getCurrentCityId();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockClient.rpc.mockResolvedValue(createErrorResponse('RPC error'));

      const result = await getCurrentCityId();

      expect(result).toBeNull();
    });
  });

  describe('setCityContext()', () => {
    it('should set city context', async () => {
      mockClient.rpc.mockResolvedValue(createSuccessResponse(null));

      await setCityContext(mockCity.id);

      expect(mockClient.rpc).toHaveBeenCalledWith('set_city_context', {
        city_id: mockCity.id,
      });
    });

    it('should handle errors gracefully', async () => {
      mockClient.rpc.mockResolvedValue(createErrorResponse('RPC error'));

      await expect(setCityContext(mockCity.id)).resolves.not.toThrow();
    });
  });

  describe('getCurrentCity()', () => {
    it('should return current city object', async () => {
      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const singleMock = vi.fn().mockResolvedValue(createSuccessResponse(mockCity));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await getCurrentCity();

      expect(result).toEqual(mockCity);
    });

    it('should return null when no city context', async () => {
      mockClient.rpc.mockResolvedValue(createSuccessResponse(null));

      const result = await getCurrentCity();

      expect(result).toBeNull();
    });
  });
});

describe('CoreAPI - Cities', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockResolvedValue(mockClient);
  });

  describe('getCity()', () => {
    it('should get city by ID', async () => {
      const singleMock = vi.fn().mockResolvedValue(createSuccessResponse(mockCity));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await getCity(mockCity.id);

      expect(result).toEqual(mockCity);
      expect(mockClient.from).toHaveBeenCalledWith('cities');
    });

    it('should return null when city not found', async () => {
      const singleMock = vi.fn().mockResolvedValue(
        createErrorResponse('City not found')
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await getCity('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getCityBySlug()', () => {
    it('should get city by slug', async () => {
      const singleMock = vi.fn().mockResolvedValue(createSuccessResponse(mockCity));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await getCityBySlug('adelaide');

      expect(result).toEqual(mockCity);
    });

    it('should return null when slug not found', async () => {
      const singleMock = vi.fn().mockResolvedValue(
        createErrorResponse('City not found')
      );

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            is: vi.fn().mockReturnValue({
              single: singleMock,
            }),
          }),
        }),
      } as any);

      const result = await getCityBySlug('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getAllCities()', () => {
    it('should get all active cities', async () => {
      const cities = [mockCity];
      const orderMock = vi.fn().mockResolvedValue(createSuccessResponse(cities));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: orderMock,
            }),
          }),
        }),
      } as any);

      const result = await getAllCities();

      expect(result).toEqual(cities);
    });

    it('should return empty array on error', async () => {
      const orderMock = vi.fn().mockResolvedValue(createErrorResponse('Database error'));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          is: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: orderMock,
            }),
          }),
        }),
      } as any);

      const result = await getAllCities();

      expect(result).toEqual([]);
    });
  });

  describe('createCity()', () => {
    it('should create city as super admin', async () => {
      const newCity = {
        name: 'Melbourne',
        slug: 'melbourne',
        logo_url: null,
        hero_image_url: null,
        accent_color: '#000000',
        is_active: true,
      };

      // Mock super admin check
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const limitMock = vi.fn().mockResolvedValue(
        createSuccessResponse([{ role: 'super_admin' }])
      );

      // First call: isSuperAdmin check
      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse({ ...mockCity, ...newCity })
      );

      let callCount = 0;
      mockClient.from.mockImplementation((table) => {
        callCount++;
        if (table === 'user_city_roles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: limitMock,
                }),
              }),
            }),
          } as any;
        } else if (table === 'cities') {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: singleMock,
              }),
            }),
          } as any;
        }
      });

      const result = await createCity(newCity);

      expect(result).toMatchObject(newCity);
    });

    it('should not create city as non-super admin', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const limitMock = vi.fn().mockResolvedValue(createSuccessResponse([]));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: limitMock,
            }),
          }),
        }),
      } as any);

      const result = await createCity({
        name: 'Melbourne',
        slug: 'melbourne',
        logo_url: null,
        hero_image_url: null,
        accent_color: '#000000',
        is_active: true,
      });

      expect(result).toBeNull();
    });
  });

  describe('updateCity()', () => {
    it('should update city as super admin', async () => {
      const updates = { name: 'Adelaide Updated' };

      // Mock super admin check
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const limitMock = vi.fn().mockResolvedValue(
        createSuccessResponse([{ role: 'super_admin' }])
      );

      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse({ ...mockCity, ...updates })
      );

      mockClient.from.mockImplementation((table) => {
        if (table === 'user_city_roles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: limitMock,
                }),
              }),
            }),
          } as any;
        } else if (table === 'cities') {
          return {
            update: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: singleMock,
                }),
              }),
            }),
          } as any;
        }
      });

      const result = await updateCity(mockCity.id, updates);

      expect(result).toMatchObject(updates);
    });

    it('should not update city as non-super admin', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const limitMock = vi.fn().mockResolvedValue(createSuccessResponse([]));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: limitMock,
            }),
          }),
        }),
      } as any);

      const result = await updateCity(mockCity.id, { name: 'Hacked' });

      expect(result).toBeNull();
    });
  });
});

describe('CoreAPI - User-City-Roles', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockResolvedValue(mockClient);
  });

  describe('getUserCities()', () => {
    it('should get all cities for current user', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const userCities = [mockUserCityRole];
      const eqMock = vi.fn().mockResolvedValue(createSuccessResponse(userCities));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      } as any);

      const result = await getUserCities();

      expect(result).toEqual(userCities);
    });

    it('should return empty array when not authenticated', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getUserCities();

      expect(result).toEqual([]);
    });
  });

  describe('addUserToCity()', () => {
    it('should add user to city as city admin', async () => {
      const targetUserId = 'new-user-id';

      // Mock current user
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock isAdmin check (getUserRole)
      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const singleMock = vi.fn().mockResolvedValue(
        createSuccessResponse(mockUserCityRole)
      );

      const limitMock = vi.fn().mockResolvedValue(createSuccessResponse([]));

      let fromCallCount = 0;
      mockClient.from.mockImplementation((table) => {
        fromCallCount++;
        if (table === 'user_city_roles' && fromCallCount === 1) {
          // First call: isAdmin check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue(
                    createSuccessResponse({ role: 'city_admin' })
                  ),
                }),
              }),
            }),
          } as any;
        } else if (table === 'user_city_roles' && fromCallCount === 2) {
          // Second call: isSuperAdmin check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  limit: limitMock,
                }),
              }),
            }),
          } as any;
        } else if (table === 'user_city_roles') {
          // Third call: actual insert
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: singleMock,
              }),
            }),
          } as any;
        }
      });

      const result = await addUserToCity(targetUserId, mockCity.id, 'member');

      expect(result).toEqual(mockUserCityRole);
    });

    it('should not add user to city as non-admin', async () => {
      mockClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      // Mock not admin
      const singleMock = vi.fn().mockResolvedValue(
        createErrorResponse('Not found')
      );
      const limitMock = vi.fn().mockResolvedValue(createSuccessResponse([]));

      mockClient.from.mockImplementation((table) => {
        if (table === 'user_city_roles') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  single: singleMock,
                  limit: limitMock,
                }),
              }),
            }),
          } as any;
        }
      });

      const result = await addUserToCity('new-user', mockCity.id);

      expect(result).toBeNull();
    });
  });
});

describe('CoreAPI - Groups', () => {
  let mockClient: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockClient = createMockSupabaseClient();
    const { createClient } = require('@/lib/supabase/server');
    createClient.mockResolvedValue(mockClient);
  });

  describe('getGroups()', () => {
    it('should get all groups in city', async () => {
      const groups = [
        {
          id: 'group-1',
          city_id: mockCity.id,
          name: 'Developers',
          description: 'For developers',
          is_public: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ];

      mockClient.rpc.mockResolvedValue(createSuccessResponse(mockCity.id));

      const orderMock = vi.fn().mockResolvedValue(createSuccessResponse(groups));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: orderMock,
          }),
        }),
      } as any);

      const result = await getGroups();

      expect(result).toEqual(groups);
    });

    it('should return empty array when no city context', async () => {
      mockClient.rpc.mockResolvedValue(createSuccessResponse(null));

      const result = await getGroups();

      expect(result).toEqual([]);
    });
  });

  describe('getGroupMembers()', () => {
    it('should get all members of a group with profiles', async () => {
      const members = [
        {
          id: 'member-1',
          group_id: 'group-1',
          user_id: mockUser.id,
          joined_at: '2024-01-01',
          profile: mockProfile,
        },
      ];

      const eqMock = vi.fn().mockResolvedValue(createSuccessResponse(members));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      } as any);

      const result = await getGroupMembers('group-1');

      expect(result).toEqual(members);
      expect(mockClient.from).toHaveBeenCalledWith('group_members');
    });

    it('should return empty array on error', async () => {
      const eqMock = vi.fn().mockResolvedValue(createErrorResponse('Group not found'));

      mockClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: eqMock,
        }),
      } as any);

      const result = await getGroupMembers('non-existent');

      expect(result).toEqual([]);
    });
  });
});
