import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../index';
import type { YouTubeChannel, Submission, Category, UpdateChannelDto, User, AuthResponseDto, RegisterDto, LoginDto, ResetPasswordDto } from '../../types';
import { setCredentials } from '../index';

const unwrapResult = <T>(response: { data?: { $values?: T } | T }): T => {
    const data = response.data;
    if (data && typeof data === 'object' && '$values' in data) {
        return (data.$values || []) as T;
    }
    return (data || []) as T;
};
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Channel', 'Submission', 'Category'],
  endpoints: (builder) => ({
    /**
     * Auth endpoint
     */
    login: builder.mutation<AuthResponseDto, LoginDto>({
      query: (credentials) => ({
        url: '/Auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { data: { user: User; token: string } }) => {
        return response.data;
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          console.log(error)
        }
      },
    }),
    register: builder.mutation<{ message: string }, RegisterDto>({
      query: (credentials) => ({
        url: '/Auth/register',
        method: 'POST',
        body: credentials,
      }),
    }),

    forgotPassword: builder.mutation<string, { email: string }>({
      query: ({ email }) => ({
        url: '/Auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response: { message: string }) => response.message,
    }),

    resetPassword: builder.mutation<string, ResetPasswordDto>({
      query: (credentials) => ({
        url: '/Auth/reset-password',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response: { message: string }) => response.message,
    }),

    refreshToken: builder.mutation<AuthResponseDto, void>({
        query: () => ({
            url: '/Auth/refresh-token',
            method: 'POST',
        })
    }),
    fetchUserByToken: builder.query<User, void>({
      query: () => '/Auth/me',
      providesTags: ['User']
    }),
    // --- Channels Endpoints ---
    getChannels: builder.query<{ channels: YouTubeChannel[], lastUpdated: string }, void>({
      query: () => '/Channels',
      providesTags: (result) =>
        result && result.channels
          ? [...result.channels.map(({ id }) => ({ type: 'Channel' as const, id })), 'Channel']
          : ['Channel'],
      transformResponse: (response: { data: { channels: { $values?: YouTubeChannel[] } | YouTubeChannel[], lastUpdated: string } }) => {
        const channelsData = response.data.channels;
        const channels = (channelsData && typeof channelsData === 'object' && '$values' in channelsData) ? channelsData.$values : channelsData || [];
        return { channels: channels as YouTubeChannel[], lastUpdated: response.data.lastUpdated };
      }
    }),
    getChannelById: builder.query<YouTubeChannel, string>({
      query: (id) => `/Channels/${id}`,
      providesTags: (result, error, id) => [{ type: 'Channel', id }],
      transformResponse: (response: { data: YouTubeChannel }) => response.data,
    }),
    updateChannel: builder.mutation<YouTubeChannel, { id: string; data: UpdateChannelDto }>({
      query: ({ id, data }) => ({
        url: `/Channels/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Channel', id },
        'Channel',
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getChannelById', id, (draft) => {
            Object.assign(draft, data);
            if (data.categoryId) {
              draft.categoryId = data.categoryId;
            }
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    deleteChannel: builder.mutation<void, string>({
      query: (id) => ({
        url: `/Channels/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Channel', id },
        'Channel',
      ],
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          apiSlice.util.updateQueryData('getChannels', undefined, (draft) => {
            draft.channels = draft.channels.filter(channel => channel.id !== id);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    getVipChannels: builder.query<YouTubeChannel[], void>({
      query: () => '/Channels/vip',
      providesTags: ['Channel'],
      transformResponse: (response: { data: { $values?: YouTubeChannel[] } | YouTubeChannel[] }): YouTubeChannel[] => {
        const data = response.data;
        if (data && typeof data === 'object' && '$values' in data) {
          return data.$values || [];
        }
        return (Array.isArray(data) ? data : []);
      },
    }),
    toggleVipStatus: builder.mutation<YouTubeChannel, string>({
      query: (id) => ({
        url: `/Channels/${id}/vip`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Channel'],
      transformResponse: (response: { data: YouTubeChannel }) => response.data,
    }),
    getPendingSubmissions: builder.query<Submission[], void>({
        query: () => '/Submissions/pending',
        providesTags: ['Submission'],
        transformResponse: unwrapResult,
    }),
    addSubmission: builder.mutation<Submission, { channelUrl: string; categoryId: number; submittedByEmail?: string }>({
        query: (newSubmission) => ({
            url: '/Submissions',
            method: 'POST',
            body: newSubmission,
        }),
        invalidatesTags: ['Submission'],
        transformResponse: (response: { data: Submission }) => response.data,
    }),
    approveSubmission: builder.mutation<void, number>({
        query: (id) => ({
            url: `/Submissions/${id}/approve`,
            method: 'POST',
        }),
        invalidatesTags: ['Channel', 'Submission'],
    }),
    rejectSubmission: builder.mutation<void, number>({
        query: (id) => ({
            url: `/Submissions/${id}/reject`,
            method: 'POST',
        }),
        invalidatesTags: ['Submission'],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => '/Categories',
      providesTags: ['Category'],
      transformResponse: unwrapResult,
    }),
    createCategory: builder.mutation<Category, Category>({
      query: (body) => ({
        url: '/Categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, Category>({
      query: ({ id, ...body }) => ({
        url: `/Categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `/Categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

 // Export hooks for usage in functional components
 export const {
   //Auth queries and mutations
   useLoginMutation,
   useRegisterMutation,
   useForgotPasswordMutation,
   useResetPasswordMutation,
   useRefreshTokenMutation,
   useFetchUserByTokenQuery,
   // Channel queries and mutations
   useGetChannelsQuery,
   useGetChannelByIdQuery,
   useUpdateChannelMutation,
   useDeleteChannelMutation,
   useGetVipChannelsQuery,
   useToggleVipStatusMutation,

   // Submissions
   useGetPendingSubmissionsQuery,
   useAddSubmissionMutation,
   useApproveSubmissionMutation,
   useRejectSubmissionMutation,

   // Categories
   useGetCategoriesQuery,
   useCreateCategoryMutation,
   useUpdateCategoryMutation,
   useDeleteCategoryMutation
 } = apiSlice;

