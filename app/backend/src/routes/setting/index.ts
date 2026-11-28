import { createOpenAPIHono } from "@backend/src/openapi";
import { getSettingHandler } from "./controler/getSetting";
import { updateSetting } from "./controler/updateSetting";
import { getSettingRoute, updateSettingRoute } from "./setting.router";

export const settingModule = createOpenAPIHono()
  .openapi(getSettingRoute, getSettingHandler)
  .openapi(updateSettingRoute, updateSetting);
