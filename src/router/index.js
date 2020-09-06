import Vue from 'vue'
import VueRouter from "vue-router";

const Login = ()=> import('../views/login/Login');
const Home = ()=> import('../views/home/Home');
const Welcome = ()=> import('../views/welcome/Welcome');
const Users = ()=> import('../views/users/Users');
const Rights = ()=> import('../views/power/Rights');
const Roles = ()=> import('../views/power/Roles');
const Category = ()=> import('../views/goods/Category');
const Params = ()=> import('../views/goods/Params');
const List = ()=> import('../views/goods/List');
const Add = ()=> import('../views/goods/Add');

Vue.use(VueRouter);

const routes = [
  {
    path: '',
    redirect: '/login',
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children:[
      {
        path: '/welcome',
        component: Welcome,
      },
      {
        path: '/users',
        component: Users,
      },
      {
        path: '/rights',
        component: Rights,
      },
      {
        path: '/roles',
        component: Roles,
      },
      {
        path: '/categories',
        component: Category,
      },
      {
        path: '/params',
        component: Params,
      },
      {
        path: '/goods',
        component: List,
      },
      {
        path: '/goods/add',
        component: Add,
      }
    ]
  }
];

const router = new VueRouter({
  routes,
  mode: 'history',
});

//路由导航守卫，在跳转前判断
router.beforeEach((to,from,next)=>{
  if(to.path === '/login') return next();
  const tokenStr = window.sessionStorage.getItem('token');
  if(!tokenStr) return next('/login');
  else return next();
});

export default router;