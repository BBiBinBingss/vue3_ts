import fs from 'node:fs'
import path from 'node:path'

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

export default {
  description: '创建页面',
  prompts: [
    {
      type: 'list',
      name: 'createType',
      message: '请选择页面创建方式',
      choices: [
        {
          name: '按功能模块创建（src/pages/<module>/<page>）',
          value: 'module',
        },
        {
          name: '在已有目录创建',
          value: 'path',
        },
      ],
      default: 'module',
    },
    {
      type: 'input',
      name: 'moduleName',
      message: '请输入功能模块名（例如：system、user）',
      when: (answers) => answers.createType === 'module',
      validate: (value) => {
        if (!value || value.trim() === '') {
          return '功能模块名不能为空'
        }

        return true
      },
    },
    {
      type: 'list',
      name: 'path',
      message: '请选择页面创建目录',
      choices: getFolders('src/pages'),
      when: (answers) => answers.createType === 'path',
    },
    {
      type: 'input',
      name: 'name',
      message: '请输入文件名',
      validate: (v) => {
        if (!v || v.trim() === '') {
          return '文件名不能为空'
        } else {
          return true
        }
      },
    },
    {
      type: 'confirm',
      name: 'withPageComponents',
      message: '是否创建页面内 components 拆分目录',
      default: true,
    },
    {
      type: 'input',
      name: 'pageComponentName',
      message: '请输入页面内组件名称',
      default: 'PageContent',
      when: (answers) => answers.withPageComponents,
      validate: (value) => {
        if (!value || value.trim() === '') {
          return '组件名称不能为空'
        }

        return true
      },
    },
  ],
  actions: (data) => {
    const targetPath =
      data.createType === 'module' ? path.join('src/pages', data.moduleName) : data.path
    const relativePath = path.relative('src/pages', targetPath)
    const actions = [
      {
        type: 'add',
        path: `${targetPath}/{{dotCase name}}/index.vue`,
        templateFile: 'plop-tpls/page/index.hbs',
        data: {
          componentName: `${relativePath || 'root'} ${data.name}`,
          withPageComponents: data.withPageComponents,
          pageComponentName: data.pageComponentName,
        },
      },
      {
        type: 'add',
        path: `${targetPath}/{{dotCase name}}/index.less`,
      },
    ]

    if (data.withPageComponents) {
      actions.push(
        {
          type: 'add',
          path: `${targetPath}/{{dotCase name}}/components/{{properCase pageComponentName}}/index.vue`,
          templateFile: 'plop-tpls/page/page-component.hbs',
        },
        {
          type: 'add',
          path: `${targetPath}/{{dotCase name}}/components/{{properCase pageComponentName}}/index.less`,
        },
      )
    }

    return actions
  },
}
