/*
 * @Author: tangbo 852425209@qq.com
 * @Date: 2022-06-15 15:30:27
 * @LastEditors: tangbo 852425209@qq.com
 * @LastEditTime: 2022-06-15 15:41:23
 * @FilePath: \saas-platform\plop-tpls\page\prompt.js
 * @Description:
 */
const path = require('path')
const fs = require('fs')

function getFolder(path) {
  let components = []
  const files = fs.readdirSync(path)
  files.forEach(function (item) {
    let stat = fs.lstatSync(path + '/' + item)
    if (stat.isDirectory() === true && item != 'components') {
      components.push(path + '/' + item)
      components.push.apply(components, getFolder(path + '/' + item))
    }
  })
  return components
}

module.exports = {
  description: '创建页面',
  prompts: [
    {
      type: 'list',
      name: 'path',
      message: '请选择页面创建目录',
      choices: getFolder('src/pages'),
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入文件名',
      validate: (v) => {
        if (!v || v.trim === '') {
          return '文件名不能为空'
        } else {
          return true
        }
      },
    },
  ],
  actions: (data) => {
    let relativePath = path.relative('src/pages', data.path)
    const actions = [
      {
        type: 'add',
        path: `${data.path}/{{dotCase name}}/index.vue`,
        templateFile: 'plop-tpls/page/index.hbs',
        data: {
          componentName: `${relativePath} ${data.name}`,
        },
      },
      {
        type: 'add',
        path: `${data.path}/{{dotCase name}}/index.less`,
      },
    ]
    return actions
  },
}
