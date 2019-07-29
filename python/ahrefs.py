#!/usr/bin/env python
# -*- coding: utf-8 -*-



USER = 'YoSEO3'
PASSWORD = 'reuniones'
INSTALLATION = 'C:\\Users\\Alberto\\AppData\\Local\\Programs\\Opera\\62.0.3331.99\\opera.exe'
OPERA_PROFILE = '/Users/alberto/Library/Application Support/com.operasoftware.Opera'


try:
  # IMPORTS
  import sys
  import os
  import subprocess
  import time
  from selenium import webdriver
  from selenium.webdriver.chrome import service
  from selenium.webdriver.support.ui import WebDriverWait
  from selenium.webdriver.common.by import By
  from selenium.webdriver.support import expected_conditions as EC
  from selenium.common.exceptions import TimeoutException
  from urllib.parse import quote
  import json

  vueltasReinicio = 0
  idStatus = -1
  def updateMensaje(typeValue,text,status,add):
    global idStatus
    if(add==True):
      idStatus = idStatus + 1
    if(typeValue=='msg'):
      print(json.dumps({'type':typeValue, 'id':idStatus, 'text':text, 'status':status}))
  def updateDataBase(idDocument, idKeyword, listResultados):
    print(json.dumps({'type':'db', 'idDocument':idDocument, 'idKeyword':idKeyword, 'listResultados':listResultados}))

  parametros = sys.argv[1]
  parametros = json.loads(parametros)

  osActual = parametros["os"]

  if osActual=='WINDOWS':
    EXECUTABLE_PATH = os.path.dirname(os.path.abspath(__file__))+'\\drivers\\operadriver.exe'
  else:
    EXECUTABLE_PATH = os.path.dirname(os.path.abspath(__file__))+'/drivers/operadriver'

  # con esto cerramos todos los browser de opera para empezaar con uno nuevo.
  def closeOperaApp():
    if osActual=='MAC':
      subprocess.call(['pkill', '-f', 'Opera'])
    else:
      #os.system("taskkill /F /IM Opera.exe")
      subprocess.run("taskkill /F /IM Opera.exe", capture_output=True)
  closeOperaApp()  

  #Variables
  URL_EXTENSION = 'chrome-extension://ddgknphabgpfbjedajaondamhejkohkd/popup.html'
  urlKeywords = 'https://ahrefs.com/v3-keywords-explorer/google/'+'es'+'/overview'
  #Ajustes Opera Brower
  options = webdriver.ChromeOptions()
  options.add_argument('user-data-dir=' + OPERA_PROFILE)
  options.add_argument('--headless')
  if osActual=='WINDOWS':
    options.binary_location=INSTALLATION


  driver = webdriver.Opera(executable_path=EXECUTABLE_PATH,options=options)
  wait = WebDriverWait(driver,10)

  try:
    #Esperar tantos segundos como se introduzcan
    def waitSeconds(seconds):
      print(json.dumps({'type':'msg', 'id':5461, 'text':'Esperado ', 'status':'running', 'seconds':seconds}))
      time.sleep(seconds)
      print(json.dumps({'type':'msg', 'id':5461, 'text':'Esperado ', 'status':'ok', 'seconds':seconds}))
    # timepo en escribir letras
    def sendDelayedKeys(element, text, delay) :
      for c in text :
          endtime = time.time() + delay
          element.send_keys(c)
          time.sleep(endtime - time.time())
    #Comprobar que la primera pestana es la url de la extension, sino es asi borrar todas las pestanas menos la primera he lanzar pagina
    def checkTabs():
      waitSeconds(2)
      if (len(driver.window_handles)>0):
        for tab in range(len(driver.window_handles)-1, -1, -1) :
          driver.switch_to.window(driver.window_handles[tab])
          if(tab>0):
            driver.close()
    #Funcion Login
    def login():
      global USER
      global PASSWORD
      try:
        updateMensaje('msg','Introduciendo username: <b>'+USER+'</b>','running',True)
        inputUser = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,'div#login-form > input#user')))
        inputUser.clear()
        inputUser.send_keys(USER)
        updateMensaje('msg','Introduciendo username: <b>'+USER+'</b>','ok',False)
        waitSeconds(1)

        updateMensaje('msg','Introduciendo pass: <b>'+PASSWORD+'</b>','running',True)
        inputPassword = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#login-form > input#password')))
        inputPassword.clear()
        inputPassword.send_keys(PASSWORD)
        updateMensaje('msg','Introduciendo pass: <b>'+PASSWORD+'</b>','ok',False)

        btnSignIn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#login-form > a#entrar')))
        btnSignIn.click()
        waitSeconds(1)
        checkTabs()
        return True
      except:
        return False
    #Comprobar si existe la sesion abierta, si no esta abierta iniciaremos sesion y si esta abierta refrescaremos con el buton de refresh. 
    def is_login():
      try:
        formLogin = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#login-form')))
        hidden = True if 'display:none' in formLogin.get_attribute('style').replace(' ','') else False
        #Si hidden es falso significa que hay que hacer el login
        if hidden==False :
          return login()
        else:
          clean_cache()
          return True
      except TimeoutException:
        return False
    #clean_cache()
    def clean_cache():
      try:
        #updateMensaje('msg','Limpiando cache','running',True)
        btnCache = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#cookies-div > a#cookies-button')))
        btnCache.click()
        #updateMensaje('msg','Limpiando cache','ok',False)
        waitSeconds(2)
      except:
        return False
    #reiniciamos todo
    def reiniciar():
      global vueltasReinicio
      vueltasReinicio = vueltasReinicio + 1

      if vueltasReinicio==4: 
        raise Exception()
      #cerramos las tabs menos la primera
      checkTabs()
      driver.refresh()
      search = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#faq-div > a#salir')))
      search.click()

      waitSeconds(2)
      is_login()
      waitSeconds(2)
      open_ahrefs()

    
    # con esto abrimos ahrefs para empezart a buscar las keywords
    def open_ahrefs():
      updateMensaje('msg','Abriendo: <b>Ahrefs</b>','running',True)

      """ 
      ahrefBtn = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#table > div#tbody > div.tool:nth-child(2)')))
      textBtn = ahrefBtn.find_element_by_css_selector('div.data > div.name').text
      if textBtn=='Ahrefs SEO' :
        ahrefBtn.click()
      else:
        raise Exception()
      """ 
      
      #clickcakmos el boton de Ahrefs cuando se escribe en el input ese servicio
      search = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#table > div.search > input')))
      search.send_keys('Ahrefs SEO')
      waitSeconds(2)
      btnAhrefs = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR,'div#table > div#tbody > div.tool > div > a.button')))
      btnAhrefs.click()
      
      #asegurarnos que la pagina se abre correctaamente
      page = False
      vueltas = 0
      while page==False and vueltas<4:
        vueltas = vueltas + 1
        if len(driver.window_handles)==1:
          waitSeconds(2)
        elif len(driver.window_handles)==2:
          driver.switch_to.window(driver.window_handles[1])
          if 'ahrefs.com/dashboard' in driver.current_url:
            #comprobamos que en la cabecera existe el menu con el item de las keywords
            btnKeyword = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div.navbar > ul.navbar-nav > li.nav-item > a[href="/v3-keywords-explorer"]')))
            #btnKeyword.click()
            #driver.get(urlKeywords)
            page = True
          else:
            waitSeconds(2)
      
      if vueltas==4 :
        updateMensaje('msg','Abriendo: <b>Ahrefs</b>','error',False)
        reiniciar()
      else:
        updateMensaje('msg','Abriendo: <b>Ahrefs</b>','ok',False)




    #Abrir pestana ahrefs, si no se abre una nueva pestana con la url pertinente abra que reiniciar todas las funciones.
    #1.Cerrar sesion, 2.Iniciar sesion, 3.Abrir pagina, 4.Comprobar pagina

    #bucle con las keywords y buscar la keyword con sus respectivas comprobaciones de que todo ha salido bien. Ejm: comprobar la url


    def get_results(idDocument, idKeyword, keyword, kw):
      listResultados=[]
      keyword = quote(keyword)
      updateMensaje('msg','Buscando: <b>'+kw+'</b>','running',True)
      urlKey = 'https://ahrefs.com/keywords-explorer/terms/1/volume_desc?keyword='+keyword+'&country=es'
      driver.get(urlKey)

      #comprobamos que existe al menos un resultado
      try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#explorer_data > table#main_se_data_table > tbody#container > tr[name="site_explorer_data_rows"]')))
      except:
        #si salta este catch es que no tiene ninguna linea en la tabla de keywords erncontradas
        listResultados.append('empty')
        updateDataBase(idDocument, idKeyword, listResultados)
        updateMensaje('msg','Buscando <b>keyword</b>','ok',False)
        return False

      #revisar que los resultados por pagina sean 100
      itemsPerPage = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'#items_per_page_title')))
      if '100' not in itemsPerPage.text:
        javaScript = "SetItemsPerPage(100, '"+urlKey+"', 'se');"
        driver.execute_script(javaScript)
        is100 = False
        while (is100==False):
          waitSeconds(2)
          itemsPerPage = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'#items_per_page_title')))
          if '100' in itemsPerPage.text:
            is100 = True
      
      table = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div#explorer_data > table#main_se_data_table > tbody#container')))
      rows = table.find_elements_by_css_selector('tr.ke__metrics__row[name="site_explorer_data_rows"]')

      for elm in rows:
        kwd = elm.find_element_by_css_selector('td.ToHighlightColumn > a').text
        volume = elm.find_element_by_css_selector('td.metric_volume').text.replace(',','.')
        result = kwd+", "+volume #kwd.encode('utf-8').strip()+", "+volume.encode('utf-8').strip()
        ##listResultados = listResultados+'"'+result+'",'
        listResultados.append(result)

      updateDataBase(idDocument, idKeyword, listResultados)
      updateMensaje('msg','Buscando: <b>'+kw+'</b>','ok',False)


    #MAIN FUNCTION --------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
    updateMensaje('msg','<b>'+parametros["item"]['name']+'</b>','info',True)
    #Abriendo navegador y la pagina del modulo -------------------------------------------------------------------------------------------------
    updateMensaje('msg','Abriendo navegador <b>Opera</b>','running',True)
    
    checkTabs()
    driver.get(URL_EXTENSION)
    updateMensaje('msg','Abriendo navegador <b>Opera</b>','ok',False)
    #------------------------------------------------------------------------------------------------------------------------------------------

    is_login()
    waitSeconds(2)
    open_ahrefs()


    #Empezamos a buscar 

    idDocument = parametros["item"]["id_document"]
    keywords = parametros["item"]["keywords"]
    # print the keys and values
    for key in keywords:
      #waitSeconds(1)
      idKeyword = keywords[key]['id_keyword']
      keyword = keywords[key]['keyword']
      try:
        results = keywords[key]['results']
      except :
        get_results(idDocument, idKeyword, keyword, keywords[key]['keyword'])

    driver.quit()
    updateMensaje('msg','Done','ok',True)

  except:
    try:
      driver.quit()
    except:
      pass
    
    updateMensaje('msg','Ha ocurrido algún error','error',True)


except:
  print(json.dumps({'type':'msg', 'id':1000, 'text':'Ha ocurrido algún error', 'status':'error'}))

sys.stdout.flush()
