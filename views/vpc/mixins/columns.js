import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getCopyWithContentTableColumn({
        field: 'cidr_block',
        title: '目标网段',
        sortable: true,
      }),
      getPublicScopeTableColumn(),
      getProjectDomainTableColumn(),
      getRegionTableColumn(),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getStatusTableColumn({ statusModule: 'vpc' }),
      {
        field: 'wire_count',
        title: '二层网络',
        width: 100,
        sortable: true,
      },
      {
        field: 'network_count',
        title: 'IP子网数量',
        width: 100,
        sortable: true,
        slots: {
          default: ({ row }) => {
            if (row.network_count <= 0) return row.network_count
            return [
              <side-page-trigger name='VpcSidePage' id={row.id} tab='network-list' vm={this}>{row.network_count}</side-page-trigger>,
            ]
          },
        },
      },
    ]
  },
}
