import React, { useState, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import { useWeb3 } from '../contexts/Web3Context.js';
import Prompt from './Prompt.js';
import BottomBar from './BottomBar.js';
import asciiArt from '../assets/ascii-art.txt';
import { FaEthereum, FaGithub, FaTwitter, FaBook, FaBars, FaTelegram } from 'react-icons/fa';
import Intro from './Intro.js';
import { usePopUp } from '../contexts/PopUpContext.js';
import Trade from './Trade.js';
import Transfer from './Transfer.js';
import Clawback from './Clawback.js';
import ChartModal from './ChartModal.js';
import Lore from './Lore.js';

// Add this global style component
const GlobalStyle = createGlobalStyle`
  html, body, #root {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
`;

const TerminalContainer = styled.div`
  background-color: #000000;
  color: #e0e0e0;
  // font-family: 'Helvetica Neue';
  font-family: 'Fira Code', monospace;
  padding: 20px;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  overflow: hidden;
  ${props => props.isMobile && `
    width: 100%;
    height: 100vh;
    border-radius: 0;
  `}
`;

const beeMotion = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(0.5px, 0.5px) rotate(0.5deg); }
  50% { transform: translate(0, 1px) rotate(0deg); }
  75% { transform: translate(-0.5px, 0.5px) rotate(-0.5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

const AsciiArtContainer = styled.pre`
  font-size: 0.3em;
  line-height: 1;
  color: #00ff00;
  text-align: center;
  margin-bottom: 20px;
  animation: ${props => props.isAnimating ? beeMotion : 'none'} 0.5s infinite;
`;

const ClickableAsciiArtContainer = styled(AsciiArtContainer)`
  transition: opacity 0.3s ease;
  width: 20vw;
  margin: auto;

  &:hover {
    opacity: 0.8;
  }
`;

const TerminalContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  margin-bottom: 5px;
  color: #ffffff;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  scrollbar-width: none;  /* Firefox */
  
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    display: none;  /* Chrome, Safari, and Opera */
  }

  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
`;

const OutputDiv = styled.div`
  position: absolute;
  top: 60px;  // Adjust this value to position below the GitHub icon
  left: 20px;
  max-width: 80%;
  max-height: 20%;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 0.8em;
  color: #00ff00;
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  z-index: 5;  // Ensure it's above other elements

  &::-webkit-scrollbar {
    display: none;  // Hide scrollbar for WebKit browsers
  }
  scrollbar-width: none;  // Hide scrollbar for Firefox
`;

const CommandSpan = styled.span`
  color: skyblue;
`;

const glitterAnimation = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
`;

const GlitterContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Glitter = styled.div`
  position: absolute;
  width: 5px;
  height: 5px;
  background-color: #fff;
  border-radius: 50%;
  opacity: 0;
  animation: ${glitterAnimation} 0.5s infinite;
  animation-delay: ${props => props.delay}s;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
`;

const AsciiArtWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const EthIcon = styled(FaEthereum)`
  vertical-align: middle;
  margin-right: 2px;
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 10;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  color: #ccc;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;

  &:hover {
    color: #fff;
  }
`;

const DropdownContent = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: black;
  border-radius: 8px;  // Round edges for the entire dropdown
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
`;

const DropdownItem = styled.a`
  color: #00ff00;
  padding: 12px;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  border-radius: 4px;  // Round edges for each item
  margin: 4px;  // Add some margin to separate items and show individual roundness
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 20px;
  }
`;

const MenuContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;  // Add some space between the menu and BottomBar
  ${props => props.isMobile && `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.8);
    padding: 10px;
  `}
`;

const rippleEffect = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const MenuItem = styled.button`
  background-color: transparent;
  color: #f0f0f0;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  // font-family: 'Helvetica Neue';
  font-family: 'Fira Code', monospace;
  font-size: 1em;
  transition: all 0.3s ease;
  position: relative;

  &:after {
    content: '';
    position: absolute;
    width: 0;
    height: 2px;
    bottom: 0;
    left: 50%;
    background-color: #00ff00;
    transition: all 0.3s ease;
  }

  &:hover {
    color: #00ff00;
    &:after {
      width: 100%;
      left: 0;
    }
  }

  ${props => props.isSelected && `
    color: #00ff00;
    &:after {
      width: 100%;
      left: 0;
    }
  `}

  ${props => props.isMobile && `
    padding: 15px;
    font-size: 18px;
    position: relative;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
  `}
`;

const RippleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
`;

const Ripple = styled.span`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  width: 100px;
  height: 100px;
  margin-top: -50px;
  margin-left: -50px;
  animation: ${rippleEffect} 1s;
`;

const RippleButton = ({ children, onClick, isMobile, isSelected }) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);

  const addRipple = (event) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const ripple = { x, y, key: Date.now() };
    setRipples((prevRipples) => [...prevRipples, ripple]);
  };

  const handleClick = (event) => {
    if (isMobile) {
      addRipple(event);
    }
    onClick(event);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setRipples([]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <MenuItem 
      ref={buttonRef} 
      onClick={handleClick} 
      isMobile={isMobile}
      isSelected={isSelected}
    >
      {children}
      {isMobile && (
        <RippleContainer>
          {ripples.map((ripple) => (
            <Ripple
              key={ripple.key}
              style={{
                left: ripple.x,
                top: ripple.y,
              }}
            />
          ))}
        </RippleContainer>
      )}
    </MenuItem>
  );
};

const RoseUsdButton = styled.span`
  font-family: 'Fira Code', monospace;
  color: #00FF00;
  font-size: 12px;
  position: absolute;
  bottom: 40px;
  left: 39px;
`;

const Terminal = ({ isMobile }) => {
  const [history, setHistory] = useState([]);
  const [asyncOutput, setAsyncOutput] = useState(null);
  const [asciiLogo, setAsciiLogo] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showTrade, setShowTrade] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showLaunch, setShowLaunch] = useState(false);
  const [showClawback, setShowClawback] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [showLore, setShowLore] = useState(false);
  const terminalContentRef = useRef(null);
  const outputRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { isConnected, signer, provider, balance: nativeBalance, roseBalance, chainId, rose, reserve0, reserve1, alpha } = useWeb3();
  const { showPopUp } = usePopUp();

  useEffect(() => {
    fetch(asciiArt)
      .then(response => response.text())
      .then(text => setAsciiLogo(text));
  }, []);

  useEffect(() => {
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop = terminalContentRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (asyncOutput) {
      setHistory(prev => [...prev, { type: 'output', content: asyncOutput }]);
      setAsyncOutput(null);
    }
  }, [asyncOutput]);

  const animateLogo = async (callback) => {
    setIsAnimating(true);
    try {
      await callback();
    } finally {
      setIsAnimating(false);
    }
  };

  const handleMenuClick = (command) => {
    if (!isConnected && command !== 'clawback' && command !== 'launch' && command !== 'lore') {
      setHistory(prev => [...prev, { type: 'output', content: 'Please connect your wallet.' }]);
      return;
    }

    if (provider && provider.network) {
      const chainId = provider.network.chainId;
      if (chainId !== 1n && chainId !== 17000n) {
        setHistory(prev => [...prev, { type: 'output', content: "Change network to the Holesky Testnet or Ethereum Mainnet" }]);
        return;
      }
    }

    setHistory(prev => [...prev, { type: 'command', content: command }]);

    // Close all command interfaces
    setShowLaunch(false);
    setShowTrade(false);
    setShowTransfer(false);
    setShowClawback(false);
    setShowLore(false);

    let output = '';
    switch (command) {
      case 'launch':
        if (showLaunch) {
          setShowLaunch(false);
          setSelectedCommand(null);
          output = 'Closing launch interface...';
        } else {
          setShowLaunch(true);
          setShowTrade(false);
          setShowTransfer(false);
          setShowClawback(false);
          setShowLore(false);
          setSelectedCommand('launch');
          output = 'Opening launch interface...';
        }
        break;
      case 'trade':
        if (showTrade) {
          setShowTrade(false);
          setSelectedCommand(null);
          output = 'Closing trade interface...';
        } else {
          setShowTrade(true);
          setShowLaunch(false);
          setShowTransfer(false);
          setShowClawback(false);
          setShowLore(false);
          setSelectedCommand('trade');
          output = 'Opening trade interface...';
        }
        break;
      case 'transfer':
        if (showTransfer) {
          setShowTransfer(false);
          setSelectedCommand(null);
          output = 'Closing transfer interface...';
        } else {
          setShowTransfer(true);
          setShowLaunch(false);
          setShowTrade(false);
          setShowClawback(false);
          setShowLore(false);
          setSelectedCommand('transfer');
          output = 'Opening transfer interface...';
        }
        break;
      case 'clawback':
        if (showClawback) {
          setShowClawback(false);
          setSelectedCommand(null);
          output = 'Closing clawback interface...';
        } else {
          setShowClawback(true);
          setShowLaunch(false);
          setShowTrade(false);
          setShowTransfer(false);
          setShowLore(false);
          setSelectedCommand('clawback');
          output = 'Opening clawback interface...';
        }
        break;
      case 'lore':
        if (showLore) {
          setShowLore(false);
          setSelectedCommand(null);
          output = 'Closing lore interface...';
        } else {
          setShowLore(true);
          setShowLaunch(false);
          setShowTrade(false);
          setShowTransfer(false);
          setShowClawback(false);
          setSelectedCommand('lore');
          output = 'Opening lore interface...';
        }
        break;
      default:
        output = `Command not found: ${command}`;
    }

    setHistory(prev => [...prev, { type: 'output', content: output }]);
  };

  const renderGlitters = () => {
    const glitters = [];
    for (let i = 0; i < 20; i++) {
      glitters.push(
        <Glitter
          key={i}
          delay={Math.random()}
          top={Math.random() * 100}
          left={Math.random() * 100}
        />
      );
    }
    return glitters;
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleContainerClick = (e) => {
    // Only focus the input if the click wasn't on the GitHub link
    if (!e.target.closest('a')) {
      // Remove this line as we no longer have an input field
      // inputRef.current.focus();
    }
  };

  const handleLogoClick = () => {
    if (rose) {
      navigator.clipboard.writeText(rose).then(
        () => {
          showPopUp('Rose address copied to clipboard!');
        },
        (err) => {
          console.error('Failed to copy Rose address: ', err);
          showPopUp('Failed to copy Rose address');
        }
      );
    } else {
      showPopUp('Rose address not available');
    }
  };

  const handleOpenChartModal = () => {
    setIsChartModalOpen(true);
  };

  const handleCloseChartModal = () => {
    setIsChartModalOpen(false);
  };

  const renderMenuItems = () => {
    // if (!isConnected) {
    //   return null;
    // }

if (chainId === 17000n) {
      // Holesky Testnet options
      return ['trade', 'transfer', 'lore'].map(command => (
        <RippleButton
          key={command}
          onClick={() => handleMenuClick(command)}
          isMobile={isMobile}
          isSelected={selectedCommand === command}
        >
          {command}
        </RippleButton>
      ));
    } else {
      // Mainnet options
      return ['clawback', 'lore'].map(command => (
        <RippleButton
          key={command}
          onClick={() => handleMenuClick(command)}
          isMobile={isMobile}
          isSelected={selectedCommand === command}
        >
          {command}
        </RippleButton>
      ));
    };
  }

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <>
      <GlobalStyle />
      <TerminalContainer onClick={handleContainerClick} isMobile={isMobile}>
        <DropdownContainer>
          <DropdownButton onClick={toggleDropdown}>
            <FaBars />
          </DropdownButton>
          <DropdownContent isOpen={isDropdownOpen}>
            <DropdownItem 
              href="https://github.com/RedRoseMoney/Rose" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="GitHub"
            >
              <FaGithub />
            </DropdownItem>
            <DropdownItem 
              href="https://twitter.com/punkmoneyrose" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="Twitter"
            >
              <FaTwitter />
            </DropdownItem>
            <DropdownItem
              href="https://t.me/+dxSYXf2wdJc0MmNl"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="Telegram"
            >
              <FaTelegram />
            </DropdownItem>
            <DropdownItem 
              href="https://rose-money.gitbook.io/rose/" 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={closeDropdown}
              title="Docs"
            >
              <FaBook />
            </DropdownItem>
          </DropdownContent>
        </DropdownContainer>
        {showIntro && (
          <Intro asciiLogo={asciiLogo} onIntroComplete={handleIntroComplete} />
        )}
        <AsciiArtWrapper>
          <ClickableAsciiArtContainer 
            isAnimating={isAnimating}
            onClick={handleLogoClick}
          >
            {asciiLogo}
          </ClickableAsciiArtContainer>
          {isAnimating && (
            <GlitterContainer>
              {renderGlitters()}
            </GlitterContainer>
          )}
        </AsciiArtWrapper>
        <OutputDiv ref={outputRef}>
          {history.map((item, index) => (
            <div key={index}>
              {item.type === 'command' ? (
                <>
                  <Prompt />
                  <CommandSpan>{item.content}</CommandSpan>
                </>
              ) : (
                <div>
                  {typeof item.content === 'string' 
                    ? item.content.replace(/ETH/g, '<EthIcon />')
                    : item.content}
                </div>
              )}
            </div>
          ))}
          {asyncOutput && (
            <div>{asyncOutput}</div>
          )}
        </OutputDiv>
        <TerminalContent ref={terminalContentRef}>
          {/* Remove the history mapping from here */}
        </TerminalContent>
        <MenuContainer isMobile={isMobile}>
          {renderMenuItems()}
        </MenuContainer>
        <RoseUsdButton onClick={handleOpenChartModal} isMobile={isMobile}>💹</RoseUsdButton>
        <BottomBar />
        {showTrade && (
          <Trade 
            onClose={() => setShowTrade(false)} 
            animateLogo={animateLogo} 
            setAsyncOutput={setAsyncOutput}
          />
        )}
        {showTransfer && (
          <Transfer 
            onClose={() => setShowTransfer(false)} 
            animateLogo={animateLogo} 
            setAsyncOutput={setAsyncOutput}
          />
        )}
        {showClawback && (
          <Clawback 
            onClose={() => setShowClawback(false)} 
            animateLogo={animateLogo} 
            setAsyncOutput={setAsyncOutput}
          />
        )}
        {showLore && (
          <Lore 
            onClose={() => setShowLore(false)} 
            animateLogo={animateLogo} 
            setAsyncOutput={setAsyncOutput}
          />
        )}
        {isChartModalOpen && <ChartModal onClose={handleCloseChartModal} />}
      </TerminalContainer>
    </>
  );
};

export default Terminal;
