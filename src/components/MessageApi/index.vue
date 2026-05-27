<script lang="ts" setup>
import { onBeforeUnmount } from 'vue'
import { useMessage } from 'naive-ui'
import { setMessageApi } from '/@/utils/message'

const message = useMessage()
setMessageApi(message)

onBeforeUnmount(() => {
	setMessageApi(null)
})
</script>
