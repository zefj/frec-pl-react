import React, { Component } from 'react';

import _ from 'lodash';

import Game from '../../lib/game-of-life/controller';
import CanvasDrawer from '../../lib/game-of-life/canvasDrawer';
import Controls from './Controls';

import './styles.css';

const gridSize = 5;

class GameOfLife extends Component {
  constructor(props) {
    super(props);
    this.game = null;
    this.canvas = null;

    this.state = {
      gameReady: false,
    };

    this.handlePauseResumeClick = this.handlePauseResumeClick.bind(this);
    this.handleSpeedChanged = this.handleSpeedChanged.bind(this);
    this.handleSeedChanged = this.handleSeedChanged.bind(this);
    this.registerResizeEventListener = this.registerResizeEventListener.bind(this);
  }

  componentDidMount() {
    this.initializeGame()
  }

  registerResizeEventListener() {
    let resizeTimer;
    let wasPaused;

    let previousWidth = window.innerWidth;
    let previousHeight = window.innerHeight;

    window.addEventListener("resize", () => {
      // Save the state
      if (wasPaused === undefined) wasPaused = this.game.paused;

      // Debounce game of life reinitialization on window resize
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.canvasDrawer.init({
          ...this.getCanvasDimensions(),
          gridSize,
        });

        // Only reinit on resize upwards
        // This prevents the mobile soft keyboard to disappear immediately due to canvas updating
        // We could theoretically fix this by modifying the stateChangedListener to only force
        // update in certain conditions (focus on div or something), but whatever, this works ok
        if (previousWidth < window.innerWidth || previousHeight < window.innerHeight) {
          this.game.pause();
          this.game.init({
            ...this.getWorldDimensions(),
            gridSize,
          }).then(() => {
            if (!wasPaused) {
              this.game.start();
            }
            wasPaused = undefined;
          });
        }
      }, 250);
    });
  }

  initializeGame() {
    this.canvasDrawer = new CanvasDrawer(this.canvas);
    this.game = new Game(this.canvasDrawer);

    this.canvasDrawer.init({
      ...this.getCanvasDimensions(),
      gridSize,
    });

    return this.game.init({
      ...this.getWorldDimensions(),
      gridSize,
    })
    // game settings are held in an object inside controller, hence why we must forceUpdate each time they change - so
    // that React can update the controls component. If we moved them to local state, we could get rid of it, but that
    // works well and encapsulates everything nicely, also SRP.
      .then(this.game.registerStateChangedListener(this.forceUpdate.bind(this)))
      .then(() => { this.setState({ gameReady: true }) })
      .then(this.registerResizeEventListener)
      .then(this.game.start);
  }

  getWorldDimensions() {
    const rows = _.floor(document.body.clientHeight / gridSize);
    const columns = _.floor(document.body.clientWidth / gridSize);

    return {
      rows,
      columns,
    }
  }

  getCanvasDimensions() {
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;

    return {
      width,
      height,
    }
  }

  handlePauseResumeClick() {
    this.game.paused ? this.game.start() : this.game.pause();
  }

  handleSpeedChanged(speed) {
    this.game.changeSpeed(speed);
  }

  handleSeedChanged(seed) {
    this.game.changeSeed(seed);
  }

  render() {
    return (
      <span>
        <div className="game-of-life-wrapper">
          <canvas
            id="canvas"
            ref={(canvas) => {
              this.canvas = canvas;
            }}
          />
        </div>
        {
          this.state.gameReady &&
            <Controls
              isPaused={this.game.paused}
              seed={this.game.options.seed}
              speed={this.game.options.speed}
              onPauseResumeClick={this.handlePauseResumeClick}
              onSpeedChanged={this.handleSpeedChanged}
              onSeedChanged={this.handleSeedChanged}
            />
        }
      </span>
    );
  }
}

export default GameOfLife;
