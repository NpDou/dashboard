<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ headerTitle }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout"
        hideRequiredMark>
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" class="mb-0" v-show="!isEdit">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
          <template v-slot:extra>
            <name-repeated
              res="robots"
              version="v1"
              :name="form.fd.name" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('system.text_48')">
          <a-radio-group v-decorator="decorators.type" :disabled="isEdit">
            <a-radio-button
              v-for="item in typesOpts"
              :value="item.key"
              :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="form.fc.getFieldValue('type') === 'webhook' ? 'URL' : 'Webhook'">
          <a-input v-decorator="decorators.address" />
          <div slot="extra" v-show="form.fc.getFieldValue('type') !== 'webhook'">
            {{ $t('iam.get_params_help') }} ，{{ $t('iam.help') }} <help-link :href="getWebhookDocsUrl(form.fd.type)">{{ $t('common_386') }}</help-link>
          </div>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated/index'
import { isRequired } from '@/utils/validate'
import { ROBOT_TYPES } from '../constants'
import { getWebhookDocsUrl } from '../utils/docs'

export default {
  name: 'CreateRobotDialog',
  components: {
    DomainProject,
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const { name, domain_id, tenant_id, address, type } = this.params.data || {}
    const { projectDomainId, projectId } = this.$store.getters.userInfo
    const initType = type || 'dingtalk'

    return {
      typesOpts: ROBOT_TYPES,
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          name: '',
          type: initType,
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: domain_id || projectDomainId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: tenant_id || projectId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: name,
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('common.name')}` },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        type: [
          'type',
          {
            initialValue: initType,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        address: [
          'address',
          {
            initialValue: address,
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}Webhook` },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    isEdit () {
      return this.params.data?.id
    },
    headerTitle () {
      if (this.isEdit) {
        return this.$t('system.text_141', [this.$t('system.robot')])
      }
      return this.$t('system.text_130', [this.$t('system.robot')])
    },
  },
  methods: {
    getWebhookDocsUrl,
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doCreate (data) {
      return new this.$Manager('robots', 'v1').create({ data: data })
    },
    doUpdate (id, data) {
      return new this.$Manager('robots', 'v1').update({ id, data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const { domain, project, name, ...rest } = values
        this.loading = true

        if (this.isEdit) {
          const data = { ...rest, name }
          await this.doUpdate(this.params.data?.id, data)
        } else {
          const data = { ...rest, project: project?.key, domain: domain?.key, generate_name: name }
          await this.doCreate(data)
        }

        this.loading = false
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
        this.params.success && this.params.success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
