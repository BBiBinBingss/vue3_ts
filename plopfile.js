import pagePrompt from './plop-tpls/page/prompt.js'
import componentPrompt from './plop-tpls/component/prompt.js'
import storePrompt from './plop-tpls/store/prompt.js'

export default function (plop) {
  plop.setWelcomeMessage('请选择需要创建的模式：')
  plop.setGenerator('page', pagePrompt)
  plop.setGenerator('component', componentPrompt)
  plop.setGenerator('store', storePrompt)
}
