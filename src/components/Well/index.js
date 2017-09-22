import React, { Component } from 'react';
import PropTypes from 'prop-types';

import classNames from 'classnames';
import invariant from 'invariant';
import _ from 'lodash';

import './styles.css';

class Well extends Component {
  static childContextTypes = {
    well: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.state = { size: 'regular' };

    this.setSize = this.setSize.bind(this);
    this.setDefaultSize = this.setDefaultSize.bind(this);
  }

  getChildContext() {
    return {
      well: {
        setSize: this.setSize,
        setDefaultSize: this.setDefaultSize
      }
    };
  }

  setSize(size) {
    invariant(!_.some(['regular', 'large'], size), 'Well can only be `regular` or `large`.');
    this.setState({ size });
  }

  setDefaultSize() {
    this.setState({ size: 'regular' });
  }

  render() {
    return (
      <div className={classNames('well-container', `well--${this.state.size}`)}>
        <div className="well">
          <div className="well-edge well-edge--top" />
          <div className="well-edge well-edge--bottom" />
          <div className="well-edge well-edge--left" />
          <div className="well-edge well-edge--right" />
          <div className="well-content">
            { this.props.children }
          </div>
        </div>
      </div>
    );
  }
}

export default Well;
