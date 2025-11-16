// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import PlayersList from "../views/PlayersList.vue";
import PlayerForm from "../views/PlayerForm.vue";
import PlayerDetail from "../views/PlayerDetail.vue";
import Attendance from "../views/Attendance.vue";

const routes = [
  { path: "/", name: "Dashboard", component: Dashboard },
  { path: "/players", name: "PlayersList", component: PlayersList },
  { path: "/players/new", name: "PlayerAdd", component: PlayerForm },
  {
    path: "/players/:id",
    name: "PlayerDetail",
    component: PlayerDetail,
    props: true,
  },
  {
    path: "/players/:id/edit",
    name: "PlayerEdit",
    component: PlayerForm,
    props: true,
  },
  // Đã XÓA: { path: "/funds", name: "Fund", component: Fund },
  { path: "/attendance", name: "Attendance", component: Attendance },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
