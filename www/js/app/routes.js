var routes = [
  {
    path: '/',
    url: './index.html',
	options: {
        animate: false,
    },
  },
  {
    path: '/home',
    url: './frames/home.html',
	options: {
        animate: false,
    },
  },
  {
    path: '/onboarding',
    componentUrl: './frames/onboarding.html',
  },
  {
    path: '/login',
    componentUrl: './frames/login.html',
  },
  {
    path: '/forgot_password',
    componentUrl: './frames/login_forgotpassword.html',
  },  
  {
    path: '/legal',
    componentUrl: './frames/legal.html',
  },
  {
    path: '/tos',
    componentUrl: './frames/tos.html',
  },
    path: '/profile',
	componentUrl: './frames/profile.html'
  },
  {
    path: '/profile_edit',
	componentUrl: './frames/profile_edit.html'
  },
  {
    path: '/profile_password',
	componentUrl: './frames/profile_password.html'
  },
  {
    path: '/settings',
	componentUrl: './frames/settings.html'
  },
  {
    path: '/messages',
	componentUrl: './frames/messages.html'
  }
];
