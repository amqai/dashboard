import { Button, Table } from 'antd';
import React, { useEffect, useState } from 'react';
import { DeleteOutlined } from "@ant-design/icons";

interface PdfTableProps {
    organizationId: string;
    topicId: string;
}

interface PdfJob {
    jobId: string,
    fileName: string,
    status: string,
    totalPages: number,
    totalTokens: number,
    estimatedPrice: number,
    totalCost: number,
    totalRealCost: number,
}

const PdfTable: React.FC<PdfTableProps> = ({
    organizationId,
    topicId,
  }) => {

    const [tableData, setTableData] = useState<PdfJob[]>();

    const columns = [
        {
          key: "1",
          title: "File Name",
          dataIndex: "fileName",
        },
        {
          key: "2",
          title: "Status",
          dataIndex: "status",
        },
        {
          key: "3",
          title: "Pages",
          dataIndex: "totalPages",
        },
        {
          key: "4",
          title: "Actions",
          render: () => {
            return (
              <>
                <DeleteOutlined
                  onClick={() => {
                    console.log("Not implemented yet")
                  }}
                  style={{ color: "red", marginLeft: 12 }}
                />
              </>
            );
          },
        },
    ];


    const loadTableData = async() => {
        const jwt = localStorage.getItem('jwt');
        const url = `${import.meta.env.VITE_APP_API_URL}/api/projects/pdf?organizationId=${organizationId}&projectId=${topicId}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
        });

        if (response.ok) {
            const content = await response.json();
            setTableData(content.jobs)
        } else {
            // handle error
        }
    };

    useEffect(() => {
        (
            async () => {
                loadTableData()
            }
        )();
    }, [organizationId, topicId]);

    return (
        <>
            <div className="settings-form-buttons" style={{borderTop: 0}}>
                <Button type="primary">Upload</Button>
            </div>
            <div className="settings-form-field-100">
                <Table dataSource={tableData} columns={columns}/>
            </div>
        </>
    );
  };
  
export default PdfTable;