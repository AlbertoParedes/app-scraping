
/*----GLOBAL-----------------------------------------------*/

export const setOS = (os) => {
  return { type: "CHANGE_OS", os }
}

export const setScrapingOpera = (documentScrapingOpera) => {
  return { type: "CHANGE_RUN_SCRAPING_OPERA", documentScrapingOpera }
}

export const setPanel = (panelActivo) => {
  return { type: "CHANGE_PANEL", panelActivo }
}

export const setMenuButtonsVisibility = (obj) => {
  return { type: "CHANGE_MENU_BUTTON_VISIBILITY", obj }
}

export const setOpenPanel = (obj) => {
  return { type: "OPEN_PANEL", obj }
}









export const setPanelSeleccionado = (obj) => {
  return { type: "PANEL_SELECCIONADO", obj }
}
export const setMenu = (obj) => {
  return { type: "SET_MENU", obj }
}
export const changeActivoMenu = (obj) => {
  return { type: "CHANGE_ACTIVO_MENU", obj }
}

/*---------------------------------------------------------*/