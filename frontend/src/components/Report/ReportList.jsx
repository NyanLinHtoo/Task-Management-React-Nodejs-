import { useEffect, useState } from 'react';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Space,
  Table
} from 'antd';
import { CloseOutlined, DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ExcelDownload from './ExcelDownload';
import useCommonDialog from '../../hooks/useCommonDialog';
import { reportService, employeeService } from '../../services/apiServices';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

function ReportList() {
  const [form] = Form.useForm();
  const [isGettingData, setIsGettingData] = useState(false);
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [Dialog, openDialog] = useCommonDialog();

  useEffect(() => {
    const fetchData = async () => {
      setIsGettingData(true)
      const employeeRes = await employeeService.getAll();
      try {
        const reportRes = await reportService.getAll();
        const reports = reportRes.data.data.map(report => {
          const reportTo = employeeRes.data.find((employee) => {
            return employee.employee_id === report.report_to
          });
          const reportedBy = employeeRes.data.find((employee) => {
            return employee.employee_id === report.reported_by
          });
          return {
            ...report,
            key: report.report_id,
            created_at: `${dayjs(report.created_at).format("YYYY-MM-DD")}`,
            description: `
            ${reportedBy.employee_name},
            ${report.project},
            ${report.percentage},
            ${report.task_title},
            ${report.type},
            ${report.status},
            ${report.hour},
            ${report.problem_feeling}`,
            reportTo: `${reportTo.employee_name}`,
            reportedBy: `${reportedBy.employee_name}`

          };
        });
        setAllData(reports);
        setFilteredData(reports);
        setIsGettingData(false);
      }
      catch (err) {
        setIsGettingData(false);
        openDialog(err.message, "error");
      }
    }
    fetchData();
  }, []);

  const columns = [
    {
      title: 'Report ID',
      dataIndex: "report_id",
      width: '5%',
    },
    {
      title: 'Date',
      dataIndex: "created_at",
      width: '9%',
    },
    {
      title: 'Description',
      dataIndex: "description",
      width: '35%',
      render: (_, record) => {
        return (
          <>
            <p>Report To : {record.reportTo}</p>
            <p>Project : {record.project}</p>
            <p>【実績】</p>
            <p>
              -{record.task_title},
              &lt;{record.percentage}%&gt;,
              &lt;{record.type}&gt;,
              &lt;{record.status}&gt;,
              &lt;{record.hour} hr&gt;</p>
            <p>【所感】</p>
            <p>- {record.problem_feeling}</p>
          </>

        )
      }
    },
    {
      title: 'Report To',
      dataIndex: "reportTo",
      width: '10%'
    },
    {
      title: 'Reported By',
      dataIndex: "reportedBy",
      width: '10%'
    },
  ];

  const onSearch = async (searchInput) => {
    try {
      const results = allData.filter((item) => {
        const dateMatch = searchInput.date
          ? dayjs(item.created_at).format("YYYY-MM-DD") === dayjs(searchInput.date).format("YYYY-MM-DD")
          : true;

        const reportToMatch = searchInput.reportTo
          ? item.reportTo
            .toLowerCase()
            .includes(searchInput.reportTo.toLowerCase())
          : true;

        const reportedByMatch = searchInput.reportedBy
          ? item.reportedBy
            .toLowerCase()
            .includes(searchInput.reportedBy.toLowerCase())
          : true;

        return dateMatch && reportToMatch && reportedByMatch;
      });
      if (results.length > 0) {
        setFilteredData(results);
      } else {
        setFilteredData(null);
      }
    }
    catch (error) {
      openDialog(error.message, "error");
    }
  };

  const onClear = async () => {
    setFilteredData(allData);
    form.resetFields();
  }

  return (
    <>
      <Form
        onFinish={(values) => onSearch(values)}
        form={form}
      >
        <Row align='top' gutter={16}>
          <Col xl={14} lg={24} md={24} sm={24} xs={24}>
            <Row gutter={16}>
              <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                <Form.Item name='date' style={{ minWidth: '100%' }}>
                  <DatePicker placeholder='Date' style={{ minWidth: '100%' }} />
                </Form.Item>
              </Col>
              <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                <Form.Item name='reportedBy' style={{ minWidth: '100%' }}>
                  <Input placeholder='Reported By' />
                </Form.Item>
              </Col>
              <Col xl={8} lg={8} md={8} sm={8} xs={24}>
                <Form.Item name='reportTo' style={{ minWidth: '100%' }}>
                  <Input placeholder='Report To' />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col xl={10} lg={24} md={24} sm={24} xs={24}>
            <Space align='center' wrap style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
              <Space size='middle'>
                <Button htmlType='submit' type='primary' icon={<SearchOutlined />} >
                  Search
                </Button>
                <Button
                  type='primary'
                  danger
                  icon={<CloseOutlined />}
                  onClick={onClear}
                >
                  Clear
                </Button>
              </Space>
              <Space size='middle'>
                <ExcelDownload data={filteredData} fileName="Report List" sheetName="Sheet1">
                  <Button
                    type='primary'
                    icon={<DownloadOutlined />}
                    style={{ backgroundColor: "#00C292", color: "#fff" }}
                  >
                    Download
                  </Button>
                </ExcelDownload>
                <Link to='/report/add'>
                  <Button type='primary' ghost icon={<PlusOutlined />}>
                    New Report
                  </Button>
                </Link>
              </Space>
            </Space>
          </Col>
        </Row>
      </Form >
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isGettingData}
        scroll={{ x: 1300 }}
        pagination={{ pageSize: 5 }} />
      <Dialog />
    </>
  )
}
export default ReportList;