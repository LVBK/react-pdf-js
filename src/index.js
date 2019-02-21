/**
 * @class ReactPdfJs
 */
import PdfJsLib from 'pdfjs-dist';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class ReactPdfJs extends Component {
  static propTypes = {
    file: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.object,
    ]).isRequired,
    page: PropTypes.number,
    onDocumentComplete: PropTypes.func,
    onSizeMeasureComplete: PropTypes.func,
    scale: PropTypes.number,
    className: PropTypes.string,
  }

  static defaultProps = {
    page: 1,
    onDocumentComplete: null,
    scale: 1,
    onSizeMeasureComplete: null,
  }

  state = {
    pdf: null,
  };

  componentDidMount() {
    this.getDocument();
  }

  componentWillReceiveProps(newProps) {
    const { page, scale } = this.props;
    const { pdf } = this.state;
    if (newProps.page !== page) {
      pdf.getPage(newProps.page).then(p => this.drawPDF(p));
    }
    if (newProps.scale !== scale) {
      pdf.getPage(newProps.page).then(p => this.drawPDF(p));
    }
  }

  componentDidUpdate(prevProps) {
    const file = this.props.file;
    if (prevProps.file !== file) {
      this.getDocument();
    }
  }

  getDocument = () => {
    const {
      file,
      onDocumentComplete,
      page,
      onSizeMeasureComplete,
    } = this.props;
    PdfJsLib.GlobalWorkerOptions.workerSrc = '//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.943/pdf.worker.js';
    PdfJsLib.getDocument(file).then((pdf) => {
      this.setState({ pdf });
      if (onDocumentComplete) {
        onDocumentComplete(pdf._pdfInfo.numPages); // eslint-disable-line
      }
      pdf.getPage(page).then(p => {
        const fileSize = this.drawPDF(p);
        return fileSize;
      }).then((fileSize) => {
        if (onSizeMeasureComplete) {
          onSizeMeasureComplete(fileSize); // eslint-disable-line
        }
      });
    });
  }

  drawPDF = (page) => {
    const { scale } = this.props;
    const viewport = page.getViewport(scale);
    const { canvas } = this;
    const canvasContext = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    const fileSize = {
      height: viewport.height / scale,
      width: viewport.width / scale,
    } 
    const renderContext = {
      canvasContext,
      viewport,
    };
    page.render(renderContext);
    return fileSize;
  }

  render() {
    const { className } = this.props;
    return <canvas ref={(canvas) => { this.canvas = canvas; }} className={className} />;
  }
}
