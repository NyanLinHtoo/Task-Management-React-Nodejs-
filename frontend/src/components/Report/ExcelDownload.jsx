import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { utils } from 'xlsx/dist/xlsx.mini.min';
import { write } from 'xlsx';

const ExcelDownload = (props) => {
  const { data, fileName, sheetName } = props;
  const downloadFile = () => {
    const dataWithCorrectHeaders = data.map(item => ({
      "Report ID": item.report_id,
      "Date": item.created_at,
      "Description": item.description,
      "Report To": item.reportTo,
      "Reported By": item.reportedBy
    }));

    const ws = utils.json_to_sheet(dataWithCorrectHeaders, {
      header: ["Report ID", "Date", "Description", "Report To", "Reported By"]
    });

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, sheetName);
    const wbout = write(wb, { bookType: 'xlsx', bookSST: true, type: 'binary' });
    const buf = new ArrayBuffer(wbout.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;

    saveAs(new Blob([buf], { type: 'application/octet-stream' }), fileName + '.xlsx');
  }

  return (
    <span onClick={downloadFile}>
      {props.children}
    </span>
  );
};

ExcelDownload.propTypes = {
  data: PropTypes.array,
  fileName: PropTypes.string,
  sheetName: PropTypes.string,
  children: PropTypes.object
}

export default ExcelDownload;