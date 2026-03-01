import { Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import type { Scan } from '@/types/scan';
import { getScans } from '../services/scanApi';
import { message } from 'antd';
import { Link } from 'react-router-dom';

const PAGE_SIZE_OPTIONS = ['10', '20', '30'];
const DEFAULT_PAGE_SIZE = Number(PAGE_SIZE_OPTIONS[1]);

const { Text } = Typography;

function parseProviders(input: string): string {
    try {
        const json = JSON.parse(input);
        return Array.isArray(json.Providers) ? json.Providers.join(', ') : '';
    } catch {
        return '';
    }
}

function parseOutput(input: string): string {
    // TODO: Implement if needed, currently outputAdded and outputRemoved are directly from API response as numbers
    return ""
}

function formatDateRange(from?: string, to?: string): string {
    if (!from || !to) return '';
  
    const dateFrom = new Date(from);
    const dateTo = new Date(to);
  
    // Short day names manually mapped to match EN-style (you can localize this later)
    const shortDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dayShort = shortDays[dateFrom.getDay()];
  
    const day = String(dateFrom.getDate()).padStart(2, '0');
    const month = String(dateFrom.getMonth() + 1).padStart(2, '0');
    const year = dateFrom.getFullYear();
  
    const startTime = `${String(dateFrom.getHours()).padStart(2, '0')}:${String(dateFrom.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(dateTo.getHours()).padStart(2, '0')}:${String(dateTo.getMinutes()).padStart(2, '0')}`;
  
    // Calculate duration in seconds
    const durationMs = dateTo.getTime() - dateFrom.getTime();
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(1, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    const duration = `${minutes}:${seconds}`;
  
    return `${dayShort} ${day}.${month}.${year} (${startTime} - ${endTime}) [${duration}]`;
  }
  

const ScanListPage = () => {
    const [data, setData] = useState<Scan[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getScans(currentPage, pageSize);
            setData(res.items);
        } catch (err) {
            console.error('Failed to load scans', err);
            message.error('Failed to load scans');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, pageSize]);    

    const columns: ColumnsType<Scan> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
        },
        {
            title: 'Providers',
            render: (_, record) => parseProviders(record.input),
        },
        {
            title: 'Added',
            dataIndex: 'outputAdded',
            align: 'center',
        },
        {
            title: 'Removed',
            dataIndex: 'outputRemoved',
            align: 'center',
        },
        {
            title: 'Processed At',
            render: (_, record) => formatDateRange(record.startedAt, record.endedAt),
            align: 'center',
        },
        {
            title: 'Actions',
            render: (_, record) => (
              <Link to={`/works/${record.id}`}>
                Works
              </Link>
            ),
        }
    ];

    return (
        <>
            <Text strong style={{ fontSize: 16 }}>Scans</Text>
            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    showSizeChanger: true, // 👈 enables the page size dropdown
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    onChange: (page, size) => {
                      setCurrentPage(page);
                      setPageSize(size);
                    },
                    total: 1000, // !!! TODO: Placeholder total, ideally should come from API response
                  }}
                style={{ marginTop: 16 }}
            />
        </>
    );
};

export default ScanListPage;
