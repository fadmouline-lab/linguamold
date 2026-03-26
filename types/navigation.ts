export type RootStackParamList = {
  index: undefined;
  '(auth)': undefined;
  '(onboarding)': undefined;
  '(main)': undefined;
  '(admin)': undefined;
  'lesson/[lessonId]': { lessonId: string };
};

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  'forgot-password': undefined;
};

export type OnboardingStackParamList = {
  'select-language': undefined;
  proficiency: undefined;
  'placement-test': undefined;
};

export type MainTabParamList = {
  home: undefined;
  leaderboard: undefined;
  profile: undefined;
  browse: undefined;
  shop: undefined;
};

export type AdminStackParamList = {
  index: undefined;
  modules: undefined;
  'lessons/[moduleId]': { moduleId: string };
  'exercises/[lessonId]': { lessonId: string };
};
