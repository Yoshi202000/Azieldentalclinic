import React, { useState, useEffect } from 'react';
import $ from 'jquery'; // Import jQuery
import '../styles/Chat.css'; // Import your CSS

function Chat() {
  // State to manage the chat visibility
  const [isChatVisible, setIsChatVisible] = useState(false);

  useEffect(() => {
    if (!isChatVisible) return; // Do not run jQuery code if the chat is hidden

    // Your jQuery logic goes here
    const $messages = $('.messages-content');
    let d, m, i = 0;

    $(window).on('load', function () {
      $messages.mCustomScrollbar();
      setTimeout(fakeMessage, 100);
    });

    function updateScrollbar() {
      $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
        scrollInertia: 10,
        timeout: 0
      });
    }

    function setDate() {
      d = new Date();
      if (m !== d.getMinutes()) {
        m = d.getMinutes();
        $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
      }
    }

    function insertMessage() {
      const msg = $('.message-input').val();
      if ($.trim(msg) === '') {
        return false;
      }
      $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
      setDate();
      $('.message-input').val(null);
      updateScrollbar();
      setTimeout(fakeMessage, 1000 + (Math.random() * 20) * 100);
    }

    $('.message-submit').on('click', insertMessage);
    $(window).on('keydown', function (e) {
      if (e.which === 13) {
        insertMessage();
        return false;
      }
    });

    const Fake = [
      'Hi there, I\'m Fabio and you?',
      'Nice to meet you',
      'How are you?',
      'Not too bad, thanks',
      'What do you do?',
      'That\'s awesome',
      'Codepen is a nice place to stay',
      'I think you\'re a nice person',
      'Why do you think that?',
      'Can you explain?',
      'Anyway I\'ve gotta go now',
      'It was a pleasure chat with you',
      'Time to make a new codepen',
      'Bye',
      ':)'
    ];

    function fakeMessage() {
      if ($('.message-input').val() !== '') {
        return false;
      }
      $('<div class="message loading new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure><span></span></div>').appendTo($('.mCSB_container'));
      updateScrollbar();

      setTimeout(function () {
        $('.message.loading').remove();
        $('<div class="message new"><figure class="avatar"><img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" /></figure>' + Fake[i] + '</div>').appendTo($('.mCSB_container')).addClass('new');
        setDate();
        updateScrollbar();
        i++;
      }, 1000 + (Math.random() * 20) * 100);
    }

    // Clean up event listeners when the component unmounts
    return () => {
      $('.message-submit').off('click');
      $(window).off('keydown');
      $(window).off('load');
    };
  }, [isChatVisible]); // Only run this effect when the chat is visible

  return (
    <>
      {/* Chat Icon in the lower-left corner */}
      <div className="chat-icon" onClick={() => setIsChatVisible(!isChatVisible)}>
        <i className="fas fa-comments"></i> {/* FontAwesome icon for chat */}
      </div>

      {/* Chat Box (conditionally visible) */}
      {isChatVisible && (
        <div className="chat">
          <div className="chat-title">
            <h1>Fabio Ottaviani</h1>
            <h2>Supah</h2>
            <figure className="avatar">
              <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" alt="Avatar" />
            </figure>
          </div>
          <div className="messages">
            <div className="messages-content"></div>
          </div>
          <div className="message-box">
            <textarea type="text" className="message-input" placeholder="Type message..."></textarea>
            <button type="submit" className="message-submit">Send</button>
          </div>
        </div>
      )}

      <div className="bg"></div>
    </>
  );
}

export default Chat;
