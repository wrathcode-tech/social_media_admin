import DataTable from 'react-data-table-component';

/** Server-driven lists: pass `pagination={false}` and paginate outside (e.g. react-paginate). */
const defaultStyles = {
  headRow: {
    style: {
      borderBottom: '1px solid rgb(229 231 235)',
      minHeight: '48px',
    },
  },
  headCells: {
    style: {
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'rgb(107 114 128)',
      paddingLeft: '12px',
      paddingRight: '12px',
    },
  },
  cells: {
    style: {
      paddingLeft: '12px',
      paddingRight: '12px',
      fontSize: '13px',
    },
  },
  rows: {
    style: {
      minHeight: '52px',
      borderBottom: '1px solid rgb(243 244 246)',
    },
  },
};

export default function CustomDataTable({ customStyles, ...props }) {
  return (
    <DataTable
      direction="auto"
      responsive
      subHeaderWrap
      striped
      highlightOnHover
      fixedHeader
      customStyles={{ ...defaultStyles, ...customStyles }}
      {...props}
    />
  );
}
