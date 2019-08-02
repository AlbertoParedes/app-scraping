import dotProp from 'dot-prop-immutable';
var global = {

  os:null,
  documentScrapingOpera: false,

  menu:{
    item_1:{
      id:'home',
      categoria:1,
      activo:true,
    },
    item_2:{
      id:null,
      categoria:2,
      activo:false
    }

  },

  apps:{

    
    tracking_keywords: {
      id: 'tracking_keywords',
      categoria: 2,
      textMenu: 'Keywords Tracker',
      menuButton: false,
      titlePanel: 'Keywords explorer Ahrefs',
      image: require('../../../components/Global/Images/bg-1-2.gif'),
      desciption:'Script que se encaga de trackear las posiciones de todas las keywords guardando ademas una captura como prueba.',
      miniCard:{
        title:'Trackea keywords de clientes',
        bottomTitle:'GOOGLE',
        logo: require('../../../components/Global/Images/logos/google-logo.png'),
        classLogo:'logo-google'
      },      
    },
    

   prensarank: {
      id: 'prensarank',
      categoria: 2,
      textMenu: 'Prensarank',
      titlePanel: 'Medios de prensarank',
      desciption:'Script que se encarga de obtener los periódicos y los blogs tanto individuales como grupales de presarank',
      image: require('../../../components/Global/Images/bg-1-2.gif'),
      miniCard:{
        title:'Obtiene los medios de presarank',
        bottomTitle:'Prensarank',
        image: require('../../../components/Global/Images/wallpapers/Blur03.png'),
        logo: require('../../../components/Global/Images/logos/prensarank-logo.png'),
        classLogo:'logo-presarank'
      },
    },

    ahrefs_keywords: {
      id: 'ahrefs_keywords',
      categoria: 2,
      textMenu: 'Keywords Ahrefs',
      menuButton: false,
      titlePanel: 'Keywords explorer Ahrefs',
      image: require('../../../components/Global/Images/bg-1-2.gif'),
      desciption:'Script que se encaga de buscar términos relacionados según un listado de keywords en ahrefs',
      miniCard:{
        title:'Busca keywords semejantes',
        bottomTitle:'AHREFS',
        image: require('../../../components/Global/Images/wallpapers/Blur04.png'),
        logo: require('../../../components/Global/Images/logos/ahrefs-logo.png'),
        classLogo:'logo-ahrefs'
      },      
    },

    word2html: {
      id: 'word2html',
      categoria: 2,
      textMenu: 'Word → html',
      titlePanel: 'Documentos Word a html',
      desciption:'Script que se encarga de convertir documentos Word a HTML según una ruta o archivos seleccionados',
      image: require('../../../components/Global/Images/bg-1-2.gif'),
      miniCard:{
        title:'Convierte ficheros words a html',
        bottomTitle:'Microsoft word',
        image: require('../../../components/Global/Images/wallpapers/Blur05.png'),
        logo: require('../../../components/Global/Images/logos/word-logo.png'),
        classLogo:'logo-word'
      },
    },


  },

  panelSeleccionado:{
    categoria:1,
    idPanel:'home'
  }
  ,//con esto pasamos de un panel a otro (home=1, otro nivel = 2) etc



}


export default function (state = global, action) {
  var newState = false;
  switch (action.type) {

    case "CHANGE_OS":
      return dotProp.set(state, `os`, action.os);

    case "CHANGE_RUN_SCRAPING_OPERA":
      return dotProp.set(state, `documentScrapingOpera`, action.documentScrapingOpera);

    case "CHANGE_PANEL":
      return dotProp.set(state, `panelActivo`, action.panelActivo);

    case "CHANGE_MENU_BUTTON_VISIBILITY":
      return dotProp.set(state, `paneles.${action.obj.id}.menuButton`, action.obj.value);

    case "OPEN_PANEL":
      return dotProp.set(state, `panel_${action.obj.panel}`, action.obj.id);


    case "PANEL_SELECCIONADO":
      newState = dotProp.set(state, `panelSeleccionado.categoria`, action.obj.categoria);
      newState.panelSeleccionado.idPanel = action.obj.idPanel;
      return newState

      case "SET_MENU":
        newState = dotProp.set(state, `menu.${action.obj.activo}.activo`, true);
        Object.entries(newState.menu).forEach(([k,o])=>{
          if(action.obj.activo!==k){
            o.activo=false;
          }
          o.id=action.obj.menu[k]?action.obj.menu[k]:null
        })
        return newState
      
      case "CHANGE_ACTIVO_MENU":
        newState = dotProp.set(state, `menu.${action.obj.item}.activo`, true);
        Object.entries(newState.menu).forEach(([k,o])=>{
          if(action.obj.item!==k){
            o.activo=false;
          }
        })
        newState.panelSeleccionado={
          categoria:action.obj.categoria,
          idPanel:action.obj.id
        }
        return newState

    default:
      return state;
  }
}
