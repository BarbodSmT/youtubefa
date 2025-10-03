import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState, AppDispatch } from '../index';
import type { YouTubeChannel, Submission, Category, CategoryDto, UpdateChannelDto, User, AuthResponseDto, RegisterDto, LoginDto, ResetPasswordDto } from '../../types';
import { setCredentials } from '../index';

const unwrapResult = (response: any) => {
    return response.data?.$values || response.data;
};
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5053/api',
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

    verifyEmail: builder.mutation<string, string>({
      query: (token) => `/Auth/verify-email?token=${token}`,
      transformResponse: (response: { message: string }) => response.message,
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
      transformResponse: (response: { data: { channels: any, lastUpdated: string } }) => {
        const channels = response.data.channels?.$values || response.data.channels || [];
        return { channels, lastUpdated: response.data.lastUpdated };
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
  useVerifyEmailMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useFetchUserByTokenQuery,
  // Channel queries and mutations
  useGetChannelsQuery,
  useGetChannelByIdQuery,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  
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

