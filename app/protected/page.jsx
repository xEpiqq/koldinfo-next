'use client';

import React, { useState, useEffect, useContext } from 'react';
import { SelectedTableContext } from '../../contexts/SelectedTableContext';
import { Button } from '@/components/button';
import { Dialog, DialogTitle, DialogBody, DialogActions } from '@/components/dialog';
import { Input } from '@/components/input';
import { Fieldset, Field, Label } from '@/components/fieldset';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/table';
import { Checkbox, CheckboxField, CheckboxGroup } from '@/components/checkbox';
import { Select } from '@/components/select';
import { Badge } from '@/components/badge';
import {
  Pagination,
  PaginationPrevious,
  PaginationNext,
  PaginationList,
  PaginationPage,
  PaginationGap,
} from '@/components/pagination';
import { ChevronDownIcon } from '@heroicons/react/16/solid';

export default function Page() {
  const { selectedTable } = useContext(SelectedTableContext);

  const [results, setResults] = useState([]);
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({});

  const [filterColumn, setFilterColumn] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [columnWidths, setColumnWidths] = useState({});

  const [showColumnSelectorModal, setShowColumnSelectorModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const badgeColors = [
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
    'zinc',
  ];
  const columnColors = {};
  let colorIndex = 0;

  function getColorForColumn(columnName) {
    if (!columnColors[columnName]) {
      columnColors[columnName] = badgeColors[colorIndex % badgeColors.length];
      colorIndex++;
    }
    return columnColors[columnName];
  }

  // Define default columns for each table
  const defaultColumnsMap = {
    apo: ['person_name', 'person_title', 'person_email', 'person_phone'],
    pdl: ['name', 'phone_number', 'email', 'linkedin_url'],
    usa: ['Full name', 'Job title', 'Emails', 'Phone numbers'],
    otc: ['full_name', 'job_title', 'email', 'phone_number'],
  };

  // Initialize visible columns based on selected table and available columns
  function initializeVisibleColumns(selectedTableName, availableCols) {
    if (selectedTableName && defaultColumnsMap[selectedTableName]) {
      const defaults = defaultColumnsMap[selectedTableName];
      // Ensure that only available columns are selected
      const initialVisible = defaults.filter((col) => availableCols.includes(col));
      setVisibleColumns(initialVisible);
    } else {
      // Fallback to first 5 columns if no default is defined
      setVisibleColumns(availableCols.slice(0, 5));
    }
  }

  useEffect(() => {
    if (selectedTable) {
      fetchColumns(selectedTable);
      setFilters({});
      setOffset(0);
      setColumnWidths({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  useEffect(() => {
    if (availableColumns.length > 0 && selectedTable) {
      initializeVisibleColumns(selectedTable, availableColumns);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableColumns, selectedTable]);

  useEffect(() => {
    if (selectedTable) {
      fetchResults();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, offset, limit, selectedTable]);

  async function fetchColumns(tableName) {
    try {
      const response = await fetch(`/api/people/columns?table_name=${tableName}`);
      const data = await response.json();
      if (response.ok) {
        setAvailableColumns(data.columns);
      } else {
        console.error('Failed to fetch columns:', data.message);
      }
    } catch (error) {
      console.error('Error fetching columns:', error);
    }
  }

  async function fetchResults() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        table_name: selectedTable,
        limit: limit.toString(),
        offset: offset.toString(),
        filters: JSON.stringify(filters),
      });

      const response = await fetch(`/api/people/search?${params.toString()}`);
      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
        setTotalResults(data.totalResults || 0);
        if (Object.keys(columnWidths).length === 0 && data.results.length > 0) {
          const widths = {};
          visibleColumns.forEach((key) => {
            widths[key] = 'auto';
          });
          setColumnWidths(widths);
        }
      } else {
        console.error('Failed to fetch results:', data.message);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
    setLoading(false);
  }

  function addFilter() {
    if (!filterColumn || !filterValue) return;
    setFilters((prevFilters) => ({ ...prevFilters, [filterColumn]: filterValue }));
    setOffset(0);
    setFilterColumn('');
    setFilterValue('');
  }

  function removeFilter(column) {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      delete newFilters[column];
      return newFilters;
    });
    setOffset(0);
  }

  function handleEdit(event, person, key) {
    const value = event.target.innerText.trim();
    setResults((prevResults) =>
      prevResults.map((p) => {
        if (p === person) {
          return { ...p, [key]: value };
        } else {
          return p;
        }
      })
    );
  }

  function copyValue(value) {
    navigator.clipboard.writeText(value).then(() => {
      alert(`Copied: ${value}`);
    });
  }

  function setColumnWidth(column, width) {
    setColumnWidths((prevWidths) => ({ ...prevWidths, [column]: `${width}px` }));
  }

  function toggleColumn(column) {
    setVisibleColumns((prevColumns) => {
      if (prevColumns.includes(column)) {
        return prevColumns.filter((col) => col !== column);
      } else {
        return [...prevColumns, column];
      }
    });
  }

  async function startExport() {
    setExporting(true);

    const params = new URLSearchParams({
      table_name: selectedTable,
      filters: JSON.stringify(filters),
    });

    visibleColumns.forEach((col) => {
      params.append('columns', col);
    });

    const url = `/api/people/export?${params.toString()}`;

    try {
      // Simulate a delay for exporting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const a = document.createElement('a');
      a.href = url;
      a.download = 'people_export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }

    setExporting(false);
    closeExportModal();
  }

  function closeFilterModal() {
    setShowFilterModal(false);
  }

  function openFilterModal() {
    setShowFilterModal(true);
  }

  function openExportModal() {
    setShowExportModal(true);
  }

  function closeExportModal() {
    setShowExportModal(false);
  }

  function openColumnSelectorModal() {
    setShowColumnSelectorModal(true);
  }

  function closeColumnSelectorModal() {
    setShowColumnSelectorModal(false);
  }

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(totalResults / limit);

  function generatePageNumbers() {
    const pageNumbers = [];
    const maxPageNumbersToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
      endPage = Math.min(5, totalPages);
    } else if (currentPage >= totalPages - 2) {
      startPage = Math.max(totalPages - 4, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (startPage > 2) {
      pageNumbers.unshift('...');
      pageNumbers.unshift(1);
    } else if (startPage === 2) {
      pageNumbers.unshift(1);
    }

    if (endPage < totalPages - 1) {
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (endPage === totalPages - 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  }

  return (
    <div
      className="px-4 sm:px-6 lg:px-8 main-content"
      style={{ width: '100%', minHeight: '100vh', paddingBottom: '100px' }}
    >
      {/* Header and Controls */}
      <div className="controls sm:flex sm:items-center justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {selectedTable.toUpperCase()} Database
          </h1>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <Button onClick={fetchResults}>Refresh</Button>
          <Button onClick={openColumnSelectorModal}>Select Columns</Button>
          <Button onClick={openExportModal}>Export</Button>
          <Button onClick={openFilterModal}>Filters</Button>
        </div>
      </div>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(filters).map(([column, value]) => (
            <Badge key={column} color={getColorForColumn(column)} className="flex items-center space-x-2">
              <span>
                <strong>{column}:</strong> {value}
              </span>
              <button
                onClick={() => removeFilter(column)}
                className="ml-2 text-red-500 hover:text-red-700"
                aria-label={`Remove filter on ${column}`}
              >
                ✕
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Column Selector Modal */}
      {showColumnSelectorModal && (
        <Dialog open={showColumnSelectorModal} onClose={closeColumnSelectorModal} size="md">
          <DialogTitle>Select Columns</DialogTitle>
          <DialogBody>
            <CheckboxGroup>
              {availableColumns.map((column) => (
                <CheckboxField key={column}>
                  <Checkbox checked={visibleColumns.includes(column)} onChange={() => toggleColumn(column)} />
                  <Label>{column}</Label>
                </CheckboxField>
              ))}
            </CheckboxGroup>
          </DialogBody>
          <DialogActions>
            <Button onClick={closeColumnSelectorModal}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <Dialog open={showFilterModal} onClose={closeFilterModal} size="md">
          <DialogTitle>Manage Filters</DialogTitle>
          <DialogBody>
            <Fieldset>
              <Field>
                <Label>Select Column</Label>
                <Select
                  value={filterColumn}
                  onChange={(e) => setFilterColumn(e.target.value)}
                  className="mt-1 block w-full"
                >
                  <option value="">Select Column</option>
                  {availableColumns.map((column) => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>Condition</Label>
                <Select value="contains" onChange={() => {}} disabled className="mt-1 block w-full">
                  <option value="contains">Contains</option>
                </Select>
              </Field>
              <Field>
                <Label>Value</Label>
                <Input
                  type="text"
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  placeholder="Value"
                  className="mt-1 block w-full"
                />
              </Field>
              <Button onClick={addFilter} className="mt-4">
                Add Filter
              </Button>
            </Fieldset>
            {Object.keys(filters).length > 0 && (
              <div className="mt-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Active Filters</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(filters).map(([column, value]) => (
                    <Badge key={column} color={getColorForColumn(column)} className="flex items-center space-x-2">
                      <span>
                        <strong>{column}:</strong> {value}
                      </span>
                      <button
                        onClick={() => removeFilter(column)}
                        className="ml-2 text-red-500 hover:text-red-700"
                        aria-label={`Remove filter on ${column}`}
                      >
                        ✕
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </DialogBody>
          <DialogActions>
            <Button onClick={closeFilterModal}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Dialog open={showExportModal} onClose={closeExportModal} size="md">
          <DialogTitle>Export Data</DialogTitle>
          <DialogBody>
            {exporting ? (
              <div className="flex justify-center items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600 dark:text-indigo-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                <span className="text-gray-700 dark:text-gray-300">Exporting...</span>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Click "Start Export" to begin exporting the data with the current filters and selected columns.
              </p>
            )}
          </DialogBody>
          {!exporting && (
            <DialogActions>
              <Button onClick={closeExportModal} variant="secondary">
                Cancel
              </Button>
              <Button onClick={startExport}>Start Export</Button>
            </DialogActions>
          )}
        </Dialog>
      )}

      {/* Data Table */}
      <div className="mt-8 overflow-x-auto w-full">
        <Table bleed striped className="min-w-full w-full">
          <TableHead>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHeader
                  key={column}
                  className="relative group"
                  style={{ width: columnWidths[column] || 'auto', minWidth: '150px' }}
                >
                  <div className="flex items-center justify-between">
                    <span>{column}</span>
                    <div
                      className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-gray-300 opacity-0 group-hover:opacity-100"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        const startX = e.pageX;
                        const startWidth = e.target.parentElement.offsetWidth;
                        const onMouseMove = (moveEvent) => {
                          const width = startWidth + (moveEvent.pageX - startX);
                          if (width > 100) { // Set a minimum width
                            setColumnWidth(column, width);
                          }
                        };
                        const onMouseUp = () => {
                          document.removeEventListener('mousemove', onMouseMove);
                          document.removeEventListener('mouseup', onMouseUp);
                        };
                        document.addEventListener('mousemove', onMouseMove);
                        document.addEventListener('mouseup', onMouseUp);
                      }}
                    ></div>
                  </div>
                </TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: limit }).map((_, index) => (
                  <TableRow key={index} className="animate-pulse">
                    {visibleColumns.map((key) => (
                      <TableCell key={key}>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : results.map((person, index) => (
                  <TableRow key={index}>
                    {visibleColumns.map((key) => (
                      <TableCell
                        key={key}
                        contentEditable="true"
                        suppressContentEditableWarning={true}
                        onBlur={(event) => handleEdit(event, person, key)}
                        onDoubleClick={() => copyValue(person[key])}
                        className="whitespace-nowrap p-4 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-text"
                        style={{ width: columnWidths[key] || 'auto' }}
                      >
                        {person[key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination className="space-x-2">
          <PaginationPrevious
            onClick={() => {
              if (currentPage > 1) {
                setOffset((currentPage - 2) * limit);
              }
            }}
            disabled={currentPage === 1}
          />
          <PaginationList>
            {generatePageNumbers().map((page, index) =>
              page === '...' ? (
                <PaginationGap key={index} />
              ) : (
                <PaginationPage
                  key={page}
                  onClick={() => setOffset((page - 1) * limit)}
                  current={page === currentPage}
                >
                  {page}
                </PaginationPage>
              )
            )}
          </PaginationList>
          <PaginationNext
            onClick={() => {
              if (currentPage < totalPages) {
                setOffset(currentPage * limit);
              }
            }}
            disabled={currentPage === totalPages}
          />
        </Pagination>
      </div>
    </div>
  );
}
