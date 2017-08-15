import React from 'react';
import PropTypes from 'prop-types';
import injectSheet from 'react-jss';
import {
  compose,
  pure,
  setDisplayName,
  withHandlers,
  defaultProps,
  withState,
  lifecycle,
} from 'recompose';
import generateUUID from 'uuid/v4';

/* global window */

const fileInput = {};

const readFile = (file, done) => {
  const reader = new window.FileReader();
  reader.onload = e => done(e.target.result);
  reader.readAsDataURL(file);
};

export const FilePicker = ({
  classes,
  className,
  children,
  getFileData,
  triggerInputChange,
  uuid,
}) => (
  /* eslint jsx-a11y/no-static-element-interactions: 0 */
  // a11y will have to be set by the consumer because we cant double nest buttons
  <span aria-label="select file">
    <span
      onClick={triggerInputChange}
      className={className || classes.filePicker}
    >
      {children}
    </span>
    <input
      onChange={getFileData}
      type="file"
      style={{ display: 'none' }}
      ref={(input) => { fileInput[uuid] = input; }}
    />
  </span>
);

FilePicker.propTypes = {
  /** To meet a11y standards please use a button for the child! */
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element, PropTypes.string]).isRequired,
  /** Leave empty to use default styling, which by default inherits it's parents attributes */
  className: PropTypes.string,
  /** @ignore */
  classes: PropTypes.shape({
    filePicker: PropTypes.string,
  }).isRequired,
  /* eslint react/no-unused-prop-types: 0 */
  /** Event handler for when the file data has loaded, which async occurs after user selects file */
  onFileDataLoaded: PropTypes.func,
  /** Event handler for when an error occurs while loading the file from the user's system */
  onFileDataError: PropTypes.func,
  /** @ignore */
  getFileData: PropTypes.func.isRequired,
  /** @ignore */
  triggerInputChange: PropTypes.func.isRequired,
  /** @ignore */
  uuid: PropTypes.string,
};

FilePicker.defaultProps = {
  onFileDataError: (e) => { throw e; },
  onFileDataLoaded: () => {},
  className: null,
};

const styles = {
  filePicker: {
    border: 'inherit',
    background: 'inherit',
    textAlign: 'left',
    fontSize: 'inherit',
    color: 'inherit',
    display: 'inherit',
  },
};

export default compose(
  pure,
  withState('uuid', 'setUUID', null),
  lifecycle({
    componentDidMount() {
      this.props.setUUID(generateUUID());
    },
  }),
  defaultProps({
    fileDataError: (e) => { throw e; },
    fileDataLoaded: () => {},
  }),
  withHandlers({
    getFileData: props => (event) => {
      event.persist();
      try {
        readFile(event.target.files[0], (data) => {
          const {
            lastModified,
            name,
            size,
            type,
          } = event.target.files[0];
          props.fileDataLoaded({ data, meta: { lastModified, name, size, type } });
        });
      } catch (e) {
        props.fileDataError(e);
      }
    },
    triggerInputChange: props => () => {
      fileInput[props.uuid].click();
    },
  }),
  injectSheet(styles),
  setDisplayName('FilePicker'),
)(FilePicker);
