const fs = require('node:fs')
const path = require('node:path')

function getFolders(currentPath) {
  const folders = [currentPath]
  const files = fs.readdirSync(currentPath)

  files.forEach((item) => {
    const nextPath = path.join(currentPath, item)
    const stat = fs.lstatSync(nextPath)

    if (stat.isDirectory() && item !== 'components') {
      folders.push(...getFolders(nextPath))
    }
  })

  return folders
}

function getPageFolders(currentPath) {
  const pageFolders = []
  const files = fs.readdirSync(currentPath)

  files.forEach((item) => {
    const nextPath = path.join(currentPath, item)
    const stat = fs.lstatSync(nextPath)

    if (!stat.isDirectory() || item === 'components') {
      return
    }

    const indexVuePath = path.join(nextPath, 'index.vue')
    if (fs.existsSync(indexVuePath)) {
      pageFolders.push(nextPath)
    }

    pageFolders.push(...getPageFolders(nextPath))
  })

  return pageFolders
}

module.exports = {
  description: '创建组件',
  prompts: [
    {
      type: 'list',
      name: 'createType',
      message: '请选择组件创建方式',
      choices: [
        {
          name: '全局组件（src/components）',
          value: 'global',
        },
        {
          name: '页面组件（按页面自动定位到 page/components）',
          value: 'page-auto',
        },
        {
          name: '页面组件（手动选择目录）',
          value: 'page-manual',
        },
      ],
      default: 'page-auto',
    },
    {
      type: 'list',
      name: 'pagePath',
      message: '请选择页面目录',
      choices: getPageFolders('src/pages'),
      when: (answers) => answers.createType === 'page-auto',
    },
    {
      type: 'list',
      name: 'path',
      message: '请选择组件创建目录',
      choices: getFolders('src/pages'),
      when: (answers) => answers.createType === 'page-manual',
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入组件名称',
      validate: (v) => {
        if (!v || v.trim() === '') {
          return '组件名称不能为空'
        } else {
          return true
        }
      },
    },
  ],
  actions: (data) => {
    let componentPath = ''
    let stylePath = ''

    if (data.createType === 'global') {
      componentPath = 'src/components/{{properCase name}}/index.vue'
      stylePath = 'src/components/{{properCase name}}/index.less'
    } else if (data.createType === 'page-auto') {
      componentPath = `${data.pagePath}/components/{{properCase name}}/index.vue`
      stylePath = `${data.pagePath}/components/{{properCase name}}/index.less`
    } else {
      componentPath = `${data.path}/components/{{properCase name}}/index.vue`
      stylePath = `${data.path}/components/{{properCase name}}/index.less`
    }

    const actions = [
      {
        type: 'add',
        path: componentPath,
        templateFile: 'plop-tpls/component/index.hbs',
      },
      {
        type: 'add',
        path: stylePath,
      },
    ]

    return actions
  },
}
