newFormatters.cypress = function(name, commands) {
  var content = cypress(name).formatter(commands);
  return {
    content: content,
    extension: 'ts',
    mimetype: 'text/javascript'
  }
}

const cypress = function (scriptName){
  var _scriptName = scriptName  || "";
  const locatorType = {

      xpath: (target) => {
          return `cy.xpath("${target.replace(/\"/g, "\'")}")`
      },

      css: (target) => {
          return `cy.get("${target.replace(/\"/g, "\'")}")`
      },

      id: (target) => {
          return `cy.get("#${target.replace(/\"/g, "\'")}")`
      },

      link: (target) => {
        return `cy.get("a").contains("${target.replace(/\"/g, "\'")}")`
      },

      name: (target) => {
        return `cy.get("[name=\'${target.replace(/\"/g, "\'")}\']")`
      },

      tag_name: (target) => {
          return `cy.get("${target.replace(/\"/g, "\'")}")`
      }
  }

  // https://seleniumhq.github.io/selenium/docs/api/javascript/module/selenium-webdriver/index_exports_Key.html
  const specialKeyMap = {
      '\${KEY_LEFT}': '{leftarrow}',
      '\${KEY_UP}': '{uparrow}',
      '\${KEY_RIGHT}': '{rightarrow}',
      '\${KEY_DOWN}': '{downarrow}',
      '\${KEY_PAGE_UP}': '{pageup}',
      '\${KEY_PAGE_DOWN}': '{pagedown}',
      '\${KEY_BACKSPACE}': '{backspace}',
      '\${KEY_DEL}': '{del}',
      '\${KEY_DELETE}': '{del}',
      '\${KEY_ENTER}': '{enter}',
      '\${KEY_HOME}': '{home}'
  }

  // cypress api
  // https://docs.cypress.io/api/api/table-of-contents.html
  // katalon
  // https://docs.katalon.com/katalon-recorder/docs/selenese-selenium-ide-commands-reference.html
  const seleneseCommands = {
      "open": "cy.visit('_TARGET_');",
      "click": "_BY_LOCATOR_.click();",
      "clickAndWait": "_BY_LOCATOR_.click();",
      "doubleClick": "_BY_LOCATOR_.dblclick();",
      "type": "_BY_LOCATOR_.type('_VALUE_');",
      "pause": "cy.wait(_VALUE_);",
      "refresh": "cy.reload();",
      "sendKeys": "cy.get('body').type('_SEND_KEY_');",
      "submit": "_BY_LOCATOR_.submit();",
      "selectFrame":"// select frame",
      "select": "_BY_LOCATOR_.select('__VALUE__');",
      "goBack": "cy.go('back');",
      "assertConfirmation": "// assertConfirmation",
      "verifyText": "_BY_LOCATOR_.should('contain', '_VALUE_STR_');",
      "verifyTitle": "cy.title().should('contain', '_VALUE_STR_');",
      "verifyValue": "_BY_LOCATOR_.should('have.value', '_VALUE_STR_');",
      "assertText": "_BY_LOCATOR_.should('contain', '_VALUE_STR_');",
      "assertTitle": "cy.title().should('contain', '_VALUE_STR_');",
      "assertValue": "_BY_LOCATOR_.should('have.value', '_VALUE_STR_');",
  }

  const header =
        "/// <reference types=\"cypress\" />\n\n" +
        "context('_SCRIPT_NAME_', () => {\n\n" +
        "\tbeforeEach(() => { });\n\n" +
        "\tit('should do something', () => {\n"

  const footer =
      "\t});\n\n" +
      "\tafterEach(async () => {\n" +
      "\t});\n\n" +
      "});"

  function formatter(commands) {

      return header.replace(/_SCRIPT_NAME_/g, _scriptName) +
          commandExports(commands).content +
          footer;
  }

  function commandExports(commands) {

      let output = commands.reduce((accObj, commandObj) => {
          let {command, target, value} = commandObj
          let cmd = seleneseCommands[command]
          if (typeof (cmd) == "undefined") {
              accObj.content += `\n\n\t// WARNING: unsupported command ${command}. Object= ${JSON.stringify(commandObj)}\n\n`
              return accObj
          }

          let funcStr = cmd;

          if (typeof (accObj) == "undefined") {
              accObj = {content: ""}
          }

          let targetStr = target.trim().replace(/\'/g, "\\'")
              .replace(/\"/g, '\\"')

          let valueStr = value.trim().replace(/\'/g, "\\'")
              .replace(/\"/g, '\\"')

          let selectOption = value.trim().split("=", 2)[1];

          let locatorStr = locator(target)

          funcStr = funcStr.replace(/_STEP_/g, accObj.step)
              .replace(/_TARGET_STR_/g, targetStr)
              .replace(/_BY_LOCATOR_/g, locatorStr)
              .replace(/_TARGET_/g, target)
              .replace(/_SEND_KEY_/g, specialKeyMap[value])
              .replace(/_VALUE_STR_/g, valueStr)
              .replace(/_VALUE_/g, value)
              .replace(/_SELECT_OPTION_/g, selectOption)

          accObj.step += 1
          accObj.content += `\t\t${funcStr}\n`

          return accObj
      }, {step: 1, content: ""})


      return output
  }

  function locator(target) {
      let locType = target.split("=", 1)

      let selectorStr = target.substr(target.indexOf("=") + 1, target.length)
      let locatorFunc = locatorType[locType]
      if (typeof (locatorFunc) == 'undefined') {
          return `cy.xpath("${target.replace(/\"/g, "\'")}")`
          // return 'not defined'
      }

      return locatorFunc(selectorStr)

  }

  return {
      formatter,
      locator
  };
}
