import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("addresses", "routes/addresses.tsx"),
  route("template/:id", "routes/template.tsx"),
  route("*", "routes/404.tsx"),
] satisfies RouteConfig;
