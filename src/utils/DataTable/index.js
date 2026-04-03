import { useMemo } from 'react';
import DataTable from 'react-data-table-component';
import { useTheme } from '../../context/ThemeContext';
import { TableProgressSkeleton } from '../../components/ui/Skeleton';

/** Theme-aware styles for react-data-table-component (striped + hover). */
function buildTableStyles(isDark) {
  if (isDark) {
    return {
      table: {
        style: {
          backgroundColor: 'rgb(24 24 27)',
        },
      },
      tableWrapper: {
        style: {
          backgroundColor: 'rgb(24 24 27)',
        },
      },
      headRow: {
        style: {
          backgroundColor: 'rgb(39 39 42)',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'rgb(63 63 70)',
          minHeight: '48px',
        },
      },
      headCells: {
        style: {
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'rgb(161 161 170)',
          paddingLeft: '12px',
          paddingRight: '12px',
        },
      },
      cells: {
        style: {
          paddingLeft: '12px',
          paddingRight: '12px',
          fontSize: '13px',
          color: 'rgb(228 228 231)',
        },
      },
      rows: {
        style: {
          minHeight: '52px',
          backgroundColor: 'rgb(24 24 27)',
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'rgb(63 63 70)',
          color: 'rgb(228 228 231)',
        },
        highlightOnHoverStyle: {
          backgroundColor: 'rgb(63 63 70)',
          borderBottomColor: 'rgb(82 82 91)',
          color: 'rgb(244 244 245)',
        },
        stripedStyle: {
          backgroundColor: 'rgb(39 39 42)',
          color: 'rgb(228 228 231)',
        },
      },
      progress: {
        style: {
          backgroundColor: 'rgb(24 24 27)',
        },
      },
      noData: {
        style: {
          backgroundColor: 'rgb(24 24 27)',
          color: 'rgb(161 161 170)',
        },
      },
    };
  }

  return {
    table: {
      style: {
        backgroundColor: 'rgb(255 255 255)',
      },
    },
    tableWrapper: {
      style: {
        backgroundColor: 'rgb(255 255 255)',
      },
    },
    headRow: {
      style: {
        backgroundColor: 'rgb(249 250 251)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'rgb(229 231 235)',
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
        color: 'rgb(55 65 81)',
      },
    },
    rows: {
      style: {
        minHeight: '52px',
        backgroundColor: 'rgb(255 255 255)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: 'rgb(243 244 246)',
        color: 'rgb(55 65 81)',
      },
      highlightOnHoverStyle: {
        backgroundColor: 'rgb(243 244 246)',
        borderBottomColor: 'rgb(229 231 235)',
        color: 'rgb(17 24 39)',
      },
      stripedStyle: {
        backgroundColor: 'rgb(249 250 251)',
        color: 'rgb(55 65 81)',
      },
    },
    progress: {
      style: {
        backgroundColor: 'rgb(255 255 255)',
      },
    },
    noData: {
      style: {
        backgroundColor: 'rgb(255 255 255)',
        color: 'rgb(107 114 128)',
      },
    },
  };
}

/** Server-driven lists: pass `pagination={false}` and paginate outside (e.g. react-paginate). */
export default function CustomDataTable({ customStyles, progressComponent, ...props }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const themeStyles = useMemo(() => buildTableStyles(isDark), [isDark]);

  return (
    <DataTable
      direction="auto"
      responsive
      subHeaderWrap
      striped
      highlightOnHover
      fixedHeader
      customStyles={{ ...themeStyles, ...customStyles }}
      progressComponent={progressComponent ?? <TableProgressSkeleton />}
      {...props}
    />
  );
}
