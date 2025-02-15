<template>
  <a-popover
    placement="right"
    :overlay-class-name="overlayClassName"
    destroy-tooltip-on-hide
    :align="popoverAlign"
    :visible="visible"
    :get-popup-container="getPopupContainer"
    @visibleChange="handleVisibleChange"
    v-if="item.menus">
    <li class="l1-menu-item" :class="{ active: activeMenu.index === item.index }">
      <a class="d-flex align-items-center" @click="handleL1LinkClick">
        <div class="l1-menu-item-icon flex-shrink-0 flex-grow-0">
          <icon :type="item.meta.icon" />
        </div>
        <div class="l1-menu-item-label flex-fill text-truncate mr-2" :title="getLabel(item.meta)">{{ getLabel(item.meta) }}</div>
        <div class="l1-menu-item-right-icon flex-shrink-0 flex-grow-0">
          <a-icon type="right" />
        </div>
      </a>
    </li>
    <template slot="content">
      <div class="l2-menu-list-wrap">
        <template v-for="(l2, l2idx) of menus">
          <div :key="l2idx" class="l2-menu-list">
            <div
              class="l2-menu-group"
              v-if="l2.submenus">
              <div class="l2-menu-group-title" :title="getLabel(l2.meta)">{{ getLabel(l2.meta) }}</div>
              <template
                v-for="(sitem, sidx) of l2.submenus">
                <span href="#" :key="sidx" v-if="sitem.meta&&sitem.meta.method==='href'">
                  {{ getLabel(sitem.meta) }}11
                </span>
                <router-link
                  v-else
                  v-show="showMenu(sitem)"
                  :key="sidx"
                  class="l2-menu-item text-truncate"
                  :to="sitem.path"
                  :title="getLabel(sitem.meta)"
                  tag="a"
                  active-class="active"
                  @click.native="handleL2LinkClick">
                  {{ getLabel(sitem.meta) }}
                </router-link>
              </template>
            </div>
            <router-link
              v-else
              class="l2-menu-item text-truncate"
              :to="l2.path"
              :title="getLabel(l2.meta)"
              tag="a"
              active-class="active"
              @click.native="handleL2LinkClick">
              {{ getLabel(l2.meta) }}
            </router-link>
          </div>
        </template>
      </div>
    </template>
  </a-popover>
  <li v-else class="l1-menu-item" :class="{ active: activeMenu.index === item.index }">
    <a
      class="d-flex align-items-center"
      @click="handleL1LinkClick">
      <div class="l1-menu-item-icon">
        <icon :type="item.meta.icon" />
      </div>
      <div class="l1-menu-item-label flex-fill text-truncate mr-2" :title="getLabel(item.meta)">{{ getLabel(item.meta) }}</div>
    </a>
  </li>
</template>

<script>
export default {
  name: 'ProductsListSub',
  props: {
    item: {
      type: Object,
    },
    getLabel: Function,
    showMenu: Function,
    activeMenu: Object,
    popoverAlign: Object,
    light: Boolean,
  },
  data () {
    return {
      visible: false,
    }
  },
  computed: {
    overlayClassName () {
      let classname = 'l2-menus-popover'
      if (this.light) {
        classname += ' light-theme'
      }
      return classname
    },
    menus () {
      const menus = this.item.menus
      if (!menus) return []
      const res = []
      menus.forEach(m2item => {
        const m2 = { ...m2item }
        if (this.showMenu(m2)) {
          if (m2.submenus) {
            let flag = false
            const submenus = []
            m2.submenus.forEach(m3item => {
              if (this.showMenu(m3item)) {
                submenus.push(m3item)
                flag = true
              }
            })
            if (flag) {
              m2.submenus = submenus
              res.push(m2)
            }
          } else {
            res.push(m2)
          }
        }
      })
      return res
    },
  },
  methods: {
    searchPath (menus) {
      for (let i = 0, len = menus.length; i < len; i++) {
        const m2 = menus[i]
        if (this.showMenu(m2)) {
          if (m2.submenus) {
            for (let j = 0, jlen = m2.submenus.length; j < jlen; j++) {
              const m3 = m2.submenus[j]
              if (this.showMenu(m3)) {
                return m3.path
              }
            }
          } else {
            return m2.path
          }
        }
      }
    },
    handleVisibleChange (visible) {
      this.visible = visible
    },
    handleL2LinkClick () {
      this.visible = false
      this.$emit('route-change')
    },
    handleL1LinkClick () {
      this.visible = false
      this.$emit('route-change')
      let path
      if (this.item.menus) {
        path = this.searchPath(this.item.menus)
      } else {
        path = this.item.menu.path
      }
      this.$router.push(path)
    },
    getPopupContainer (popover) {
      return document.querySelector('#sidebar-wrap')
    },
  },
}
</script>

<style lang="less">
@import "../../styles/less/theme";

.l2-menus-popover {
  padding: 0;
  .ant-popover-inner {
    background-color: @sidebar-dark-bg-color;
  }
  .ant-popover-arrow {
    display: none;
  }
  .ant-popover-inner-content {
    padding: 0;
    margin-top: 60px;
    max-height: calc(100vh - 120px);
    overflow: auto;
    min-width: 180px;
    max-width: 180px;
  }
  &.light-theme {
    .ant-popover-inner {
      background-color: @sidebar-light-bg-color;
    }
    .l2-menu-list {
      .l2-menu-group-title {
        color: #000000;
        font-weight: 500;
      }
      .l2-menu-item {
        color: @sidebar-light-text-color;
        &:hover {
          background-color: @primary-1;
          color: @sidebar-light-hover-text-color;
        }
        &.active {
          background-color: @primary-1 !important;
          color: @sidebar-light-active-text-color;
        }
      }
    }
  }
}
.l2-menu-list-wrap {
  padding: 8px 0;
}
.l2-menu-list {
  padding: 10px 10px 0 20px;
  .l2-menu-group {
    padding-bottom: 10px;
    border-bottom: 1px solid #E2E2E2;
  }
  &:last-child .l2-menu-group {
    border-bottom:none
  }
  .l2-menu-group-title {
    font-size: 14px;
    color: rgba(255, 255, 255, .7);
    line-height: 24px;
    margin-bottom: 6px;
    margin-top: 6px;
    padding: 0 2px;
  }
  .l2-menu-item {
    display: block;
    padding-bottom: 4px;
    padding-top: 4px;
    padding-left: 18px;
    padding-right: 16px;
    font-size: 14px;
    color: @sidebar-dark-text-color;
    &:hover {
      background-color: @primary-color;
      color: @sidebar-dark-hover-text-color;
    }
    &.active {
      background-color: @primary-7 !important;
      color: @sidebar-dark-active-text-color;
    }
  }
}
</style>
