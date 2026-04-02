const fs = require('node:fs')
const path = require('node:path')

function getFolders(currentPath) {
  const folders = [currentPath]
  const files = fs.readdirSync(currentPath)

  files.forEach((item) => {
    const nextPath = path.join(currentPath, item)
    const stat = fs.lstatSync(nextPath)
    if (stat.isDirectory()) {
      folders.push(...getFolders(nextPath))
    }
  })

  return folders
}

module.exports = {
  description: '创建全局模块化状态',
  prompts: [
    {
      type: 'list',
      name: 'path',
      message: '请选择模块创建目录',
      choices: getFolders('src/store/modules'),
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入模块名称',
      validate: (value) => {
        if (!value || value.trim() === '') {
          return '模块名称不能为空'
        }

        return true
      },
    },
  ],
  actions: (data) => {
    return [
      {
        type: 'add',
        path: `${data.path}/{{camelCase name}}.ts`,
        templateFile: 'plop-tpls/store/index.hbs',
      },
    ]
  },
}
