// Setup basic express server
var express = require('express');
var fs = require('fs');
//var Baby = require('babyparse');
var csv = require('fast-csv');
var sentiment = require("sentiment")

//
var moment = require('moment');

//var natural = require('natural');
var natural = require('natural'),
    TfIdf = natural.TfIdf,
    tfidf = new TfIdf();

//var SpellChecker = require("spellchecker")


var app = express();
var server = require('http').createServer(app);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

var stream = fs.createReadStream(__dirname + '/public/data/imessage8.csv');

var messageData = [];

//data structures for mispelled words searching. 
var mispelledWords = [];
var mispelledWordsCache //= {["hasn't",112],["cuz",95],["alone",65],["with",54],["science",34]}

//data structures for most frequent word searching. 
var mostFrequentWords = [];
//var mostFrequentWordsCache = [ [ 'the', 27697 ], [ 'I', 25727 ], [ 'to', 21034 ], [ 'a', 19726 ], [ 'is', 15151 ], [ 'and', 13925 ], [ 'i', 12966 ], [ 'you', 11450 ], [ 'it', 10363 ], [ 'in', 9979 ], [ 'for', 9320 ], [ 'of', 9252 ], [ 'like', 8459 ], [ 'that', 8182 ], [ 'my', 7977 ], [ 'have', 7945 ], [ 'u', 7695 ], [ 'at', 7283 ], [ 'was', 6943 ], [ 'so', 6739 ], [ 'on', 6626 ], [ 'I\'m', 6350 ], [ 'just', 6272 ], [ 'be', 5758 ], [ 'but', 5550 ], [ 'are', 5503 ], [ 'not', 5233 ], [ 'get', 4940 ], [ 'with', 4625 ], [ 'me', 4612 ], [ 'this', 4495 ], [ 'do', 4436 ], [ 'can', 4049 ], [ 'he', 3833 ], [ 'if', 3722 ], [ 'they', 3453 ], [ 'all', 3273 ], [ 'we', 3242 ], [ 'one', 3227 ], [ 'its', 3189 ], [ 'what', 3155 ], [ 'up', 3097 ], [ 'go', 3083 ], [ 'good', 3029 ], [ 'don\'t', 3013 ], [ 'your', 2881 ], [ 'no', 2873 ], [ 'lol', 2870 ], [ 'think', 2849 ], [ 'got', 2745 ], [ 'or', 2703 ], [ 'gonna', 2694 ], [ 'out', 2665 ], [ 'Yeah', 2618 ], [ 'as', 2603 ], [ 'Lol', 2578 ], [ 'about', 2500 ], [ 'know', 2484 ], [ 'And', 2423 ], [ 'when', 2416 ], [ 'it\'s', 2385 ], [ 'But', 2363 ], [ 'from', 2326 ], [ 'would', 2293 ], [ 'too', 2253 ], [ 'It\'s', 2253 ], [ 'You', 2180 ], [ 'an', 2172 ], [ 'yeah', 2131 ], [ 'need', 2127 ], [ 'still', 2093 ], [ 'really', 2083 ], [ 'Oh', 2056 ], [ 'there', 2007 ], [ 'has', 1996 ], [ 'ur', 1976 ], [ 'more', 1923 ], [ 'how', 1909 ], [ 'will', 1901 ], [ 'want', 1884 ], [ 'did', 1881 ], [ 'well', 1812 ], [ '', 1794 ], [ 'now', 1723 ], [ 'im', 1714 ], [ 'only', 1714 ], [ 'going', 1706 ], [ 'had', 1700 ], [ 'should', 1694 ], [ 'see', 1681 ], [ 'than', 1663 ], [ 'then', 1662 ], [ 'his', 1654 ], [ 'time', 1652 ], [ 'So', 1643 ], [ 'much', 1618 ], [ 'No', 1609 ], [ 'The', 1606 ], [ 'back', 1603 ], [ 'pretty', 1560 ], [ 'right', 1493 ], [ 'haha', 1458 ], [ 'him', 1433 ], [ 'guys', 1418 ], [ 'Well', 1414 ], [ 'come', 1398 ], [ 'by', 1379 ], [ 'actually', 1365 ], [ 'even', 1359 ], [ 'What', 1355 ], [ 'play', 1350 ], [ 'last', 1333 ], [ 'wanna', 1307 ], [ 'people', 1293 ], [ 'oh', 1286 ], [ 'It', 1285 ], [ 'make', 1272 ], [ 'can\'t', 1267 ], [ 'could', 1260 ], [ 'U', 1233 ], [ 'thats', 1229 ], [ 'I\'ll', 1223 ], [ 'were', 1221 ], [ 'take', 1190 ], [ 'cuz', 1165 ], [ 'game', 1134 ], [ 'Just', 1132 ], [ 'ok', 1127 ], [ 'been', 1126 ], [ 'next', 1117 ], [ '2', 1116 ], [ 'way', 1111 ], [ 'first', 1105 ], [ 'after', 1091 ], [ 'LOL', 1085 ], [ 'He', 1085 ], [ 'We', 1084 ], [ 'Haha', 1082 ], [ 'said', 1075 ], [ 'better', 1067 ], [ 'dont', 1054 ], [ 'that\'s', 1044 ], [ 'ill', 1042 ], [ 'lot', 1023 ], [ 'didn\'t', 1016 ], [ 'That\'s', 1014 ], [ 'over', 981 ], [ 'Not', 973 ], [ 'them', 970 ], [ 'bad', 965 ], [ 'sure', 955 ], [ 'why', 955 ], [ 'Chris', 946 ], [ 'down', 936 ], [ 'he\'s', 936 ], [ '3', 931 ], [ 'work', 930 ], [ 'same', 929 ], [ 'never', 924 ], [ 'class', 921 ], [ 'mean', 917 ], [ 'though', 916 ], [ 'very', 911 ], [ 'say', 907 ], [ 'new', 903 ], [ 'already', 889 ], [ 'here', 885 ], [ 'My', 884 ], [ 'That', 880 ], [ 'you\'re', 854 ], [ 'looks', 849 ], [ 'off', 841 ], [ 'other', 838 ], [ 'If', 837 ], [ 'look', 834 ], [ 'two', 827 ], [ 'They', 826 ], [ 'thing', 824 ], [ 'Linsen', 821 ], [ 'man', 809 ], [ 'she', 809 ], [ 'who', 809 ], [ 'Ok', 803 ], [ 'doing', 800 ], [ '5', 791 ], [ 'where', 779 ], [ 'How', 766 ], [ 'something', 763 ], [ 'Don\'t', 761 ], [ 'year', 760 ], [ 'Or', 756 ], [ 'always', 753 ], [ 'their', 738 ], [ 'wait', 728 ], [ 'Ya', 728 ], [ 'any', 727 ], [ 'might', 722 ], [ 'went', 714 ], [ 'use', 709 ], [ 'before', 708 ], [ 'tell', 706 ], [ 'day', 705 ], [ 'getting', 705 ], [ 'I\'ve', 697 ], [ 'probably', 687 ], [ 'into', 687 ], [ 'This', 684 ], [ '4', 681 ], [ 'nice', 680 ], [ 'does', 678 ], [ 'doesn\'t', 677 ], [ 'am', 675 ], [ 'Hey', 675 ], [ 'which', 672 ], [ 'watch', 668 ], [ 'done', 668 ], [ 'many', 664 ], [ 'feel', 661 ], [ 'thought', 656 ], [ 'Man', 652 ], [ 'eat', 648 ], [ 'home', 646 ], [ 'hard', 645 ], [ 'our', 642 ], [ 'stuff', 642 ], [ 'long', 639 ], [ 'saw', 637 ], [ 'give', 635 ], [ 'coming', 630 ], [ 'I�m', 628 ], [ 'most', 625 ], [ 'free', 622 ], [ 'school', 620 ], [ 'He\'s', 618 ], [ 'Is', 614 ], [ 'Like', 612 ], [ 'big', 612 ], [ 'around', 609 ], [ 'prob', 608 ], [ 'find', 601 ], [ 'god', 597 ], [ 'Did', 596 ], [ 'uw', 594 ], [ 'remember', 594 ], [ 'week', 589 ], [ 'team', 580 ], [ 'guy', 580 ], [ 'us', 577 ], [ 'those', 577 ], [ 'her', 572 ], [ 'Wilbert', 571 ], [ 'makes', 570 ], [ 'idk', 567 ], [ 'football', 555 ], [ 'kinda', 555 ], [ 'math', 551 ], [ 'today', 551 ], [ 'ya', 550 ], [ 'A', 546 ], [ 'Do', 542 ], [ 'try', 539 ], [ 'everyone', 530 ], [ '10', 521 ], [ 'pick', 520 ], [ 'made', 519 ], [ 'anything', 511 ], [ 'least', 510 ], [ 'tomorrow', 506 ], [ 'also', 503 ], [ 'isn\'t', 502 ], [ 'playing', 501 ], [ 'buy', 499 ], [ 'Are', 496 ], [ '1', 494 ], [ 'Ill', 492 ], [ 'When', 490 ], [ 'it.', 489 ], [ 'Where', 487 ], [ 'fucking', 484 ], [ 'maybe', 481 ], [ 'don�t', 474 ], [ 'hate', 472 ], [ 'run', 472 ], [ 'best', 470 ], [ 'Dude', 466 ], [ 'gay', 465 ], [ 'another', 461 ], [ 'guess', 455 ], [ 'told', 453 ], [ 'food', 449 ], [ 'someone', 449 ], [ 'physics', 447 ], [ 'cause', 442 ], [ 'great', 441 ], [ 'let', 440 ], [ 'bus', 439 ], [ 'night', 439 ], [ 'fuck', 437 ], [ 'till', 434 ], [ 'hours', 432 ] ];

var mostFrequentNameCache = { '0' : ["David",146], '1' : ["chris",209],'2' : ["wilbert",182], '2' : ["linsen",352]}

var sentimentByHour = { '0': { count: 794, sentiment: 0.7027707808564232 }, '1': { count: 267, sentiment: 0.5205992509363296 }, '2': { count: 148, sentiment: 0.7432432432432432 }, '3': { count: 38, sentiment: 1.236842105263158 }, '4': { count: 8, sentiment: 0.375 }, '5': { count: 91, sentiment: 0.5824175824175825 }, '6': { count: 130, sentiment: 1 }, '7': { count: 510, sentiment: 0.6411764705882353 }, '8': { count: 1584, sentiment: 0.678030303030303 }, '9': { count: 2380, sentiment: 0.6831932773109244 }, '10': { count: 2173, sentiment: 0.6511734928670041 }, '11': { count: 2844, sentiment: 0.6715893108298172 }, '12': { count: 3213, sentiment: 0.5558667911609088 }, '13': { count: 4050, sentiment: 0.6646913580246914 }, '14': { count: 4473, sentiment: 0.4985468365750056 }, '15': { count: 4244, sentiment: 0.5596135721017907 }, '16': { count: 3307, sentiment: 0.6292712428182643 }, '17': { count: 3720, sentiment: 0.6516129032258065 }, '18': { count: 4226, sentiment: 0.5795078088026503 }, '19': { count: 3983, sentiment: 0.6610595028872709 }, '20': { count: 5015, sentiment: 0.7180458624127617 }, '21': { count: 5212, sentiment: 0.7099002302379125 }, '22': { count: 3709, sentiment: 0.7090860070099757 }, '23': { count: 2281, sentiment: 0.5879000438404208 } };

var relationshipsCache = { david: [ { number: '+12064847887', count: 51 }, { number: '+12066177563', count: 62 }, { number: '+14259431562', count: 6 }, { number: '+12069924635', count: 1 } ], linsen: [ { number: '+12066177563', count: 7 }, { number: '+14259431562', count: 41 }, { number: '+12064847887', count: 38 }, { number: '+14257365590', count: 39 }, { number: '+12069924635', count: 197 } ], chris: [ { number: '+12066177563', count: 95 }, { number: '+14259431562', count: 28 }, { number: '+12064847887', count: 22 } ], wilbert: [ { number: '+14257365590', count: 18 }, { number: '+12064847887', count: 112 }, { number: '+12069924635', count: 4 }, { number: '+14259431562', count: 2 }, { number: '+12066177563', count: 1 } ] } //david: [ { number: '+12064847887', count: 51 }, { number: '+12066177563', count: 62 }, { number: '+14259431562', count: 6 }, { number: '+12069924635', count: 1 } ], linsen: [ { number: '+12066177563', count: 7 }, { number: '+14259431562', count: 41 }, { number: '+12064847887', count: 38 }, { number: '+14257365590', count: 39 }, { number: '+12069924635', count: 197 } ], chris: [ { number: '+12066177563', count: 95 }, { number: '+14259431562', count: 28 }, { number: '+12064847887', count: 22 } ], wilbert: [ { number: '+14257365590', count: 18 }, { number: '+12064847887', count: 112 }, { number: '+12069924635', count: 4 }, { number: '+14259431562', count: 2 }, { number: '+12066177563', count: 1 } ] ];
/*
var hourlyTextsCache = { '0': [ { number: '#sender', count: 1 }, { number: '+14255030080', count: 35 }, { number: '', count: 71 }, { number: '+14259431562', count: 623 }, { number: 'cbchan2@illinois.edu', count: 14 }, { number: '+14256478071', count: 259 }, { number: '+14256814569', count: 3 }, { number: '+17087106722', count: 1 }, { number: '+12069924635', count: 504 }, { number: '+12066126652', count: 11 }, { number: '+18589975324', count: 11 }, { number: '+12063938290', count: 41 }, { number: 'lucasung51@gmail.com', count: 4 }, { number: '+14257492034', count: 14 }, { number: '+14082282190', count: 1 }, { number: '+16307797164', count: 2 }, { number: '+14254433622', count: 2 }, { number: '+12066177563', count: 914 }, { number: '+14257365590', count: 745 }, { number: '+14257614249', count: 7 }, { number: 'allisonyc@me.com', count: 12 }, { number: '+14256910798', count: 1 }, { number: 'wilbertthelam@gmail.com', count: 3 }, { number: '+16145303707', count: 2 }, { number: 'jeruntrajko@att.net', count: 1 }, { number: '+14252334939', count: 17 }, { number: '+12069133787', count: 1 }, { number: '+12245954942', count: 1 }, { number: 'kmcelligott2016@gmail.com', count: 3 }, { number: '+12063990702', count: 1 }, { number: '+18477560205', count: 5 }, { number: '+17608156895', count: 1 }, { number: '+12243300417', count: 1 }, { number: '+16505427016', count: 7 }, { number: '+12179792994', count: 4 } ], '1': [ { number: '+12066177563', count: 580 }, { number: '+14257365590', count: 399 }, { number: '+12069924635', count: 253 }, { number: '+14256478071', count: 173 }, { number: '+14259431562', count: 144 }, { number: 'allisonyc@me.com', count: 51 }, { number: 'cbchan2@illinois.edu', count: 37 }, { number: '', count: 28 }, { number: 'chrischris292@yahoo.com', count: 15 }, { number: '+16505427016', count: 12 }, { number: '+14257614249', count: 12 }, { number: '+14252334939', count: 12 }, { number: 'wilbertthelam@gmail.com', count: 11 }, { number: '+12179792994', count: 6 }, { number: '+17036063514', count: 5 }, { number: '+14255030080', count: 4 }, { number: '+16309651029', count: 3 }, { number: '+12063938290', count: 3 }, { number: '+12243743497', count: 2 }, { number: '+14254433622', count: 2 }, { number: '+14257492034', count: 2 }, { number: '+12066126652', count: 1 }, { number: '+16307797164', count: 1 }, { number: '+14088888756', count: 1 }, { number: '+12063849865', count: 1 }, { number: '+17323187818', count: 1 }, { number: '+14047238295', count: 1 }, { number: '+14256814569', count: 1 }, { number: 'jeruntrajko@att.net', count: 1 }, { number: '+18589975324', count: 1 } ], '2': [ { number: '+12066177563', count: 323 }, { number: '+14256478071', count: 285 }, { number: '+12069924635', count: 135 }, { number: 'cbchan2@illinois.edu', count: 121 }, { number: '+14257365590', count: 116 }, { number: 'chrischris292@yahoo.com', count: 102 }, { number: '+14259431562', count: 17 }, { number: 'allisonyc@me.com', count: 9 }, { number: '', count: 6 }, { number: '+14252334939', count: 5 }, { number: '+14255030080', count: 3 }, { number: '+16307797164', count: 1 }, { number: 'allison-chan@live.com', count: 1 }, { number: '+14257614249', count: 1 }, { number: '+18589975324', count: 1 }, { number: '+18477145734', count: 1 } ], '3': [ { number: '+12066177563', count: 98 }, { number: '+14256478071', count: 84 }, { number: 'cbchan2@illinois.edu', count: 61 }, { number: '+14257365590', count: 56 }, { number: '+12069924635', count: 51 }, { number: '+14259431562', count: 8 }, { number: 'ly.yongmin@gmail.com', count: 5 }, { number: '+14252334939', count: 2 }, { number: '265060', count: 1 }, { number: '+18477145734', count: 1 }, { number: '', count: 1 } ], '4': [ { number: '+12066177563', count: 38 }, { number: '+14257365590', count: 33 }, { number: '+12069924635', count: 21 }, { number: '+14256478071', count: 15 }, { number: '', count: 8 }, { number: '+14252334939', count: 6 }, { number: '+14257492034', count: 6 }, { number: '+17323187818', count: 5 }, { number: 'cbchan2@illinois.edu', count: 2 }, { number: '+14259431562', count: 2 }, { number: '+12066126652', count: 1 }, { number: 'allisonyc@me.com', count: 1 }, { number: '+18473379815', count: 1 }, { number: '+16145303707', count: 1 } ], '5': [ { number: '+14256478071', count: 92 }, { number: '+12066177563', count: 51 }, { number: 'cbchan2@illinois.edu', count: 50 }, { number: '+14257492034', count: 17 }, { number: '+14252334939', count: 9 }, { number: '', count: 8 }, { number: '+18473739392', count: 5 }, { number: '+12066126652', count: 5 }, { number: 'lucasung51@gmail.com', count: 3 }, { number: '+17323187818', count: 3 }, { number: '+14259431562', count: 2 }, { number: '+14257365590', count: 2 }, { number: '+15037307807', count: 2 }, { number: '+14256814569', count: 1 }, { number: '+15174424882', count: 1 }, { number: '+18479151353', count: 1 } ], '6': [ { number: '+14256478071', count: 85 }, { number: '+14257365590', count: 34 }, { number: '', count: 24 }, { number: '+14255030080', count: 15 }, { number: '+14259431562', count: 14 }, { number: 'lucasung51@gmail.com', count: 12 }, { number: '+12069924635', count: 12 }, { number: '+12066177563', count: 9 }, { number: '+14257492034', count: 8 }, { number: '+12066126652', count: 5 }, { number: 'chrischris292@yahoo.com', count: 4 }, { number: '+18473739392', count: 4 }, { number: '+12063938290', count: 2 }, { number: '+14256814569', count: 2 }, { number: '+18477142528', count: 1 }, { number: '+18479151353', count: 1 }, { number: '+14088888756', count: 1 }, { number: '+16505213868', count: 1 }, { number: '+16309564601', count: 1 }, { number: 'allisonyc@me.com', count: 1 }, { number: '+18589975324', count: 1 }, { number: '+14252334939', count: 1 }, { number: '+16307797164', count: 1 }, { number: '+17323187818', count: 1 } ], '7': [ { number: '+14256478071', count: 235 }, { number: '', count: 101 }, { number: '+12066126652', count: 67 }, { number: '+14257365590', count: 65 }, { number: '+12066177563', count: 57 }, { number: '+14259431562', count: 44 }, { number: 'lucasung51@gmail.com', count: 38 }, { number: 'jeruntrajko@att.net', count: 28 }, { number: '+16145303707', count: 28 }, { number: '+12069924635', count: 26 }, { number: '+14257492034', count: 25 }, { number: '+18473739392', count: 19 }, { number: '+18589975324', count: 17 }, { number: '+16309564601', count: 17 }, { number: '+14252334939', count: 17 }, { number: '+17323187818', count: 16 }, { number: '+18477142528', count: 15 }, { number: '+14255030080', count: 13 }, { number: 'cbchan2@illinois.edu', count: 12 }, { number: '+14082282190', count: 11 }, { number: '+14256814569', count: 7 }, { number: 'chrischris292@yahoo.com', count: 7 }, { number: '+16505213868', count: 5 }, { number: '+14254433622', count: 4 }, { number: '+16307797164', count: 4 }, { number: '+18477145734', count: 3 }, { number: '7535', count: 3 }, { number: '+18479151353', count: 3 }, { number: '+17608156895', count: 3 }, { number: '+16309651029', count: 3 }, { number: '+17739900729', count: 2 }, { number: '+12063938290', count: 2 }, { number: '+13125938069', count: 2 }, { number: '+12243300417', count: 2 }, { number: '+15174424882', count: 1 }, { number: '+15037307807', count: 1 }, { number: '+12177667983', count: 1 }, { number: '+12243742619', count: 1 } ], '8': [ { number: '+14256478071', count: 855 }, { number: '+12069924635', count: 227 }, { number: '+14257365590', count: 199 }, { number: '', count: 192 }, { number: '+14259431562', count: 119 }, { number: 'lucasung51@gmail.com', count: 113 }, { number: '+12066177563', count: 109 }, { number: 'cbchan2@illinois.edu', count: 65 }, { number: '+12066126652', count: 57 }, { number: '+18477142528', count: 54 }, { number: '+14257492034', count: 49 }, { number: 'chrischris292@yahoo.com', count: 45 }, { number: '+18589975324', count: 40 }, { number: 'jeruntrajko@att.net', count: 38 }, { number: '+14255030080', count: 38 }, { number: '+14256814569', count: 33 }, { number: '+18473739392', count: 25 }, { number: '+14082282190', count: 23 }, { number: '+16145303707', count: 19 }, { number: '+16309651029', count: 19 }, { number: '+16309564601', count: 19 }, { number: '+18479151353', count: 15 }, { number: '+16307797164', count: 11 }, { number: '+12062805027', count: 11 }, { number: '+12063938290', count: 9 }, { number: '+12066975398', count: 7 }, { number: '+12066979202', count: 7 }, { number: '+14252334939', count: 7 }, { number: '+12243300417', count: 6 }, { number: '+18477145734', count: 6 }, { number: '+17608156895', count: 5 }, { number: '+14252478387', count: 4 }, { number: '+18064764358', count: 4 }, { number: '+12247174056', count: 4 }, { number: '+17739900729', count: 3 }, { number: '+17323187818', count: 3 }, { number: '+12102684984', count: 2 }, { number: '+15098606661', count: 2 }, { number: '+13125938069', count: 2 }, { number: '+17087106722', count: 2 }, { number: '+14254433622', count: 1 }, { number: '+16189748702', count: 1 }, { number: '+12245156002', count: 1 }, { number: '+12177667983', count: 1 }, { number: '+14259990718', count: 1 }, { number: '+16505754203', count: 1 }, { number: '46676', count: 1 }, { number: '+16505213868', count: 1 }, { number: '+17146092963', count: 1 }, { number: '+18472041937', count: 1 }, { number: '+12245954942', count: 1 }, { number: '+18477560205', count: 1 } ], '9': [ { number: '+14256478071', count: 1234 }, { number: '+12069924635', count: 565 }, { number: '+12066177563', count: 480 }, { number: '+14257365590', count: 302 }, { number: '+14259431562', count: 295 }, { number: '', count: 244 }, { number: '+18589975324', count: 141 }, { number: '+14082282190', count: 133 }, { number: 'jeruntrajko@att.net', count: 122 }, { number: '+14257492034', count: 91 }, { number: '+12066126652', count: 62 }, { number: '+18473739392', count: 52 }, { number: '+17608156895', count: 47 }, { number: '+16145303707', count: 40 }, { number: '+14252334939', count: 38 }, { number: '+16309651029', count: 32 }, { number: '+12063938290', count: 32 }, { number: '+16307797164', count: 31 }, { number: 'cbchan2@illinois.edu', count: 30 }, { number: '+16309564601', count: 30 }, { number: '+18479151353', count: 23 }, { number: '+14255030080', count: 23 }, { number: '+18477142528', count: 22 }, { number: 'chrischris292@yahoo.com', count: 21 }, { number: 'lucasung51@gmail.com', count: 19 }, { number: '+14257614249', count: 17 }, { number: '+14252478387', count: 14 }, { number: '+13125938069', count: 13 }, { number: '+12243300417', count: 13 }, { number: '+14256814569', count: 12 }, { number: '+18472041937', count: 11 }, { number: '+18477560205', count: 11 }, { number: '+18064764358', count: 7 }, { number: '+18479973472', count: 6 }, { number: '+18477145734', count: 5 }, { number: '+15037307807', count: 4 }, { number: '+13127190168', count: 4 }, { number: '+17739900729', count: 3 }, { number: 'wilbertthelam@gmail.com', count: 3 }, { number: '+14254433622', count: 3 }, { number: '+12102684984', count: 2 }, { number: '+14253198788', count: 2 }, { number: '+14256910798', count: 2 }, { number: '+12063849865', count: 2 }, { number: '9603', count: 2 }, { number: '+12245954942', count: 2 }, { number: '+17088288820', count: 2 }, { number: '+17323187818', count: 2 }, { number: '+15098606661', count: 2 }, { number: 'allisonyc@me.com', count: 1 }, { number: '+12177213259', count: 1 }, { number: '+16505213868', count: 1 }, { number: '1410000007', count: 1 }, { number: '+16189674415', count: 1 }, { number: '+14257368921', count: 1 }, { number: '+18478401206', count: 1 }, { number: '+14088888756', count: 1 }, { number: '+12066975398', count: 1 }, { number: '1210100004', count: 1 }, { number: '+16189748702', count: 1 }, { number: '+12066979202', count: 1 }, { number: '28898788', count: 1 } ], '10': [ { number: '+14256478071', count: 1038 }, { number: '+12066177563', count: 888 }, { number: '+12069924635', count: 677 }, { number: '+14259431562', count: 670 }, { number: '+14257365590', count: 334 }, { number: '', count: 322 }, { number: '+12066126652', count: 133 }, { number: '+18589975324', count: 118 }, { number: '+14257492034', count: 81 }, { number: 'jeruntrajko@att.net', count: 67 }, { number: '+14255030080', count: 66 }, { number: 'lucasung51@gmail.com', count: 57 }, { number: 'chrischris292@yahoo.com', count: 57 }, { number: 'cbchan2@illinois.edu', count: 49 }, { number: '+16307797164', count: 40 }, { number: '+12063938290', count: 38 }, { number: '+12243300417', count: 33 }, { number: '+14256814569', count: 31 }, { number: '+16145303707', count: 28 }, { number: '+17608156895', count: 24 }, { number: '+14252334939', count: 17 }, { number: '+16309651029', count: 16 }, { number: '+14082282190', count: 13 }, { number: '+13127190168', count: 11 }, { number: '+14254433622', count: 10 }, { number: '+14252478387', count: 10 }, { number: '+18477560205', count: 10 }, { number: '+12066975398', count: 10 }, { number: '+18472041937', count: 8 }, { number: '+14257614249', count: 8 }, { number: '+18477145734', count: 8 }, { number: '+18477142528', count: 8 }, { number: '+16309564601', count: 7 }, { number: '+13125938069', count: 6 }, { number: '+12178191353', count: 5 }, { number: '+12066979202', count: 5 }, { number: 'wilbertthelam@gmail.com', count: 4 }, { number: '+18479151353', count: 4 }, { number: '+18064764358', count: 3 }, { number: '+17739910996', count: 3 }, { number: '+14256910798', count: 3 }, { number: '+14257368921', count: 3 }, { number: '+12245954942', count: 3 }, { number: '+18473739392', count: 3 }, { number: '+17323187818', count: 2 }, { number: '+17087106722', count: 2 }, { number: '+16264000017', count: 2 }, { number: '+12062805027', count: 2 }, { number: '+14254588772', count: 1 }, { number: '7535', count: 1 }, { number: '64553', count: 1 }, { number: '242733', count: 1 }, { number: 'kmcelligott2016@gmail.com', count: 1 }, { number: 'monicay1@comcast.net', count: 1 }, { number: 'unknown', count: 1 }, { number: '+14088888756', count: 1 }, { number: '+16505213868', count: 1 }, { number: '+17088288820', count: 1 }, { number: '+18478401206', count: 1 }, { number: '+11113272603', count: 1 }, { number: '+12063076030', count: 1 }, { number: '+16094336237', count: 1 }, { number: '1410000008', count: 1 }, { number: '+17734705772', count: 1 }, { number: '+14254660172', count: 1 }, { number: '262966', count: 1 } ], '11': [ { number: '+12066177563', count: 1685 }, { number: '+12069924635', count: 1322 }, { number: '+14259431562', count: 1280 }, { number: '+14256478071', count: 1093 }, { number: '+14257365590', count: 981 }, { number: '', count: 408 }, { number: '+12066126652', count: 207 }, { number: '+14255030080', count: 188 }, { number: '+18589975324', count: 156 }, { number: '+14257492034', count: 89 }, { number: 'jeruntrajko@att.net', count: 83 }, { number: '+14252334939', count: 68 }, { number: '+16307797164', count: 46 }, { number: '+14256814569', count: 40 }, { number: 'chrischris292@yahoo.com', count: 36 }, { number: 'cbchan2@illinois.edu', count: 28 }, { number: '+16145303707', count: 27 }, { number: '+12063938290', count: 26 }, { number: '+16309651029', count: 23 }, { number: '+14082282190', count: 22 }, { number: '+18477142528', count: 21 }, { number: '+17608156895', count: 20 }, { number: '+18064764358', count: 18 }, { number: '+14256910798', count: 16 }, { number: '+12243300417', count: 16 }, { number: '+18473739392', count: 15 }, { number: '+13125938069', count: 13 }, { number: '+17146092963', count: 11 }, { number: 'lucasung51@gmail.com', count: 11 }, { number: '+12062805027', count: 11 }, { number: '+17739900729', count: 9 }, { number: '+16309564601', count: 7 }, { number: '+16264000017', count: 6 }, { number: '+18477145734', count: 6 }, { number: '+17088288820', count: 6 }, { number: '+14257368921', count: 6 }, { number: '+14085696058', count: 5 }, { number: '+18477560205', count: 5 }, { number: 'wilbertthelam@gmail.com', count: 5 }, { number: '+14252478387', count: 5 }, { number: '+14254433622', count: 5 }, { number: '+12066979202', count: 4 }, { number: '+12247174056', count: 4 }, { number: '+14257614249', count: 4 }, { number: '+12066975398', count: 4 }, { number: '+12063076030', count: 3 }, { number: '+12102684984', count: 3 }, { number: '+18472041937', count: 3 }, { number: '+13127190168', count: 3 }, { number: '104', count: 3 }, { number: '+12063714530', count: 3 }, { number: '+16094336237', count: 2 }, { number: '+16304566401', count: 2 }, { number: '+16189748702', count: 2 }, { number: '+14257361986', count: 2 }, { number: '+17087106722', count: 2 }, { number: '+12063849865', count: 1 }, { number: '+14257863150', count: 1 }, { number: '+12243743497', count: 1 }, { number: '242733', count: 1 }, { number: '102', count: 1 }, { number: '+18479151353', count: 1 }, { number: '+14158152224', count: 1 }, { number: '1410000009', count: 1 }, { number: '+16195029662', count: 1 }, { number: '+12179792994', count: 1 } ], '12': [ { number: '+12066177563', count: 2497 }, { number: '+12069924635', count: 2038 }, { number: '+14259431562', count: 1457 }, { number: '+14256478071', count: 1260 }, { number: '+14257365590', count: 1143 }, { number: '', count: 346 }, { number: '+14255030080', count: 165 }, { number: '+18589975324', count: 146 }, { number: '+12066126652', count: 124 }, { number: 'jeruntrajko@att.net', count: 121 }, { number: 'lucasung51@gmail.com', count: 102 }, { number: '+14252334939', count: 75 }, { number: '+14257492034', count: 74 }, { number: 'chrischris292@yahoo.com', count: 60 }, { number: '+16145303707', count: 32 }, { number: 'cbchan2@illinois.edu', count: 30 }, { number: '+14256814569', count: 29 }, { number: '+18479151353', count: 28 }, { number: 'wilbertthelam@gmail.com', count: 25 }, { number: '+18477142528', count: 24 }, { number: '+12063938290', count: 23 }, { number: '+16307797164', count: 22 }, { number: '+14082282190', count: 21 }, { number: '+18477145734', count: 17 }, { number: '+17739900729', count: 16 }, { number: '+17608156895', count: 14 }, { number: '+14254433622', count: 13 }, { number: '+17146092963', count: 12 }, { number: '+12066975398', count: 11 }, { number: '+16309564601', count: 11 }, { number: '+18473739392', count: 9 }, { number: '+18064764358', count: 9 }, { number: '+14257614249', count: 7 }, { number: '+13125938069', count: 7 }, { number: '+13125936258', count: 6 }, { number: '+12243300417', count: 6 }, { number: '+17323187818', count: 6 }, { number: '+12102684984', count: 5 }, { number: '+16309651029', count: 5 }, { number: '+17036063514', count: 4 }, { number: '+12066979202', count: 4 }, { number: '+17088288820', count: 4 }, { number: '+12063076030', count: 3 }, { number: '+14256910798', count: 3 }, { number: '+15037307807', count: 3 }, { number: '+15174424882', count: 3 }, { number: '+12062805027', count: 3 }, { number: '+18477560205', count: 3 }, { number: '+14254635622', count: 3 }, { number: '+14252478387', count: 3 }, { number: '+14259192866', count: 3 }, { number: '+18479973472', count: 2 }, { number: '+16505754203', count: 2 }, { number: '+12178191353', count: 2 }, { number: '64553', count: 2 }, { number: '+14253197484', count: 2 }, { number: '+17087106722', count: 2 }, { number: '+14252468510', count: 2 }, { number: '+12247174056', count: 1 }, { number: '+14254660172', count: 1 }, { number: '+14255035403', count: 1 }, { number: '+14252418021', count: 1 }, { number: '46676', count: 1 }, { number: '+12177213259', count: 1 }, { number: '+14252466726', count: 1 }, { number: '+18653606565', count: 1 }, { number: 'unknown', count: 1 }, { number: '272273', count: 1 }, { number: '+13607478459', count: 1 }, { number: '+16189674415', count: 1 }, { number: '+17085437455', count: 1 }, { number: 'allisonyc@me.com', count: 1 }, { number: '+16094336237', count: 1 }, { number: '+13127190168', count: 1 }, { number: '+14252464572', count: 1 }, { number: '+14257368921', count: 1 }, { number: '+12063849865', count: 1 } ], '13': [ { number: '+12066177563', count: 3110 }, { number: '+12069924635', count: 2415 }, { number: '+14259431562', count: 2137 }, { number: '+14257365590', count: 1408 }, { number: '+14256478071', count: 1385 }, { number: '', count: 365 }, { number: 'lucasung51@gmail.com', count: 261 }, { number: '+12066126652', count: 168 }, { number: '+14257492034', count: 136 }, { number: '+18589975324', count: 127 }, { number: 'jeruntrajko@att.net', count: 124 }, { number: '+14255030080', count: 86 }, { number: 'chrischris292@yahoo.com', count: 74 }, { number: '+12063938290', count: 58 }, { number: '+17608156895', count: 55 }, { number: 'cbchan2@illinois.edu', count: 47 }, { number: '+14082282190', count: 43 }, { number: '+16307797164', count: 40 }, { number: '+16145303707', count: 39 }, { number: '+14252334939', count: 29 }, { number: '+14254433622', count: 26 }, { number: '+16309651029', count: 25 }, { number: 'wilbertthelam@gmail.com', count: 23 }, { number: '+14257614249', count: 21 }, { number: '+18479151353', count: 17 }, { number: '+18477145734', count: 16 }, { number: '+14256814569', count: 15 }, { number: '+16309564601', count: 13 }, { number: '+18473739392', count: 12 }, { number: 'allison-chan@live.com', count: 12 }, { number: '+18064764358', count: 11 }, { number: '+17739900729', count: 11 }, { number: '+18477560205', count: 10 }, { number: '+12066975398', count: 9 }, { number: '+12178191353', count: 7 }, { number: '+18479973472', count: 7 }, { number: '+12243300417', count: 7 }, { number: '+16189674415', count: 7 }, { number: '+14252478387', count: 7 }, { number: '+17146092963', count: 6 }, { number: '+17323187818', count: 6 }, { number: '+14088888756', count: 6 }, { number: '+15098606661', count: 5 }, { number: '+18477142528', count: 5 }, { number: '+16264000017', count: 5 }, { number: '+12066979202', count: 4 }, { number: '+13125938069', count: 3 }, { number: '+16189748702', count: 3 }, { number: '+14252466726', count: 3 }, { number: '+17739910996', count: 2 }, { number: '+18478143750', count: 2 }, { number: '+14253198788', count: 2 }, { number: '28888', count: 2 }, { number: '+16505754203', count: 1 }, { number: '+18653606565', count: 1 }, { number: '+14256910798', count: 1 }, { number: '+14255035403', count: 1 }, { number: '7535', count: 1 }, { number: 'allisonyc@me.com', count: 1 }, { number: '+18479222017', count: 1 }, { number: '1111440600', count: 1 }, { number: '1111440601', count: 1 }, { number: '+12102684984', count: 1 }, { number: 'monicay1@comcast.net', count: 1 }, { number: '+17088288820', count: 1 }, { number: '+18184470638', count: 1 }, { number: '+18472041937', count: 1 }, { number: '+16094336237', count: 1 }, { number: '+13127190168', count: 1 }, { number: '+16505213868', count: 1 }, { number: '+17087106722', count: 1 }, { number: '+12245229561', count: 1 }, { number: '+17036063514', count: 1 } ], '14': [ { number: '+12066177563', count: 2157 }, { number: '+14256478071', count: 1895 }, { number: '+12069924635', count: 1797 }, { number: '+14259431562', count: 1504 }, { number: '+14257365590', count: 1142 }, { number: '', count: 325 }, { number: 'lucasung51@gmail.com', count: 291 }, { number: '+14255030080', count: 184 }, { number: '+14257492034', count: 169 }, { number: '+12066126652', count: 168 }, { number: '+18589975324', count: 138 }, { number: 'jeruntrajko@att.net', count: 96 }, { number: '+18473739392', count: 77 }, { number: '+14252334939', count: 72 }, { number: 'chrischris292@yahoo.com', count: 63 }, { number: '+16145303707', count: 59 }, { number: '+12063938290', count: 37 }, { number: '+16307797164', count: 36 }, { number: '+12243300417', count: 32 }, { number: '+17608156895', count: 32 }, { number: '+18479151353', count: 28 }, { number: 'allisonyc@me.com', count: 22 }, { number: '+14257614249', count: 21 }, { number: '+14256814569', count: 20 }, { number: '+18477560205', count: 19 }, { number: '+14254433622', count: 17 }, { number: '+16309564601', count: 16 }, { number: '+14082282190', count: 15 }, { number: '+18477142528', count: 14 }, { number: 'cbchan2@illinois.edu', count: 13 }, { number: '+18477145734', count: 11 }, { number: '+13125938069', count: 10 }, { number: 'wilbertthelam@gmail.com', count: 10 }, { number: '+16189674415', count: 9 }, { number: '+12066975398', count: 8 }, { number: '+16309651029', count: 8 }, { number: '+14256910798', count: 7 }, { number: '+13127190168', count: 5 }, { number: '+18472041937', count: 5 }, { number: '+17739900729', count: 4 }, { number: '+17323187818', count: 4 }, { number: '+14088888756', count: 3 }, { number: '+14253198788', count: 3 }, { number: '+12066979202', count: 3 }, { number: '+18479973472', count: 3 }, { number: '+16189748702', count: 3 }, { number: '+14252478387', count: 3 }, { number: '+12245156002', count: 2 }, { number: '+17736992993', count: 2 }, { number: '+12102684984', count: 2 }, { number: '+15037307807', count: 2 }, { number: '78539', count: 1 }, { number: '+14255771576', count: 1 }, { number: '+14254455808', count: 1 }, { number: '+14259990718', count: 1 }, { number: '+12246224771', count: 1 }, { number: '+18064764358', count: 1 }, { number: '+16264000017', count: 1 }, { number: '+17739910996', count: 1 }, { number: '+19085109351', count: 1 }, { number: '+14252468510', count: 1 }, { number: '+17088288820', count: 1 }, { number: '242733', count: 1 }, { number: '+16094336237', count: 1 }, { number: '+14252466726', count: 1 }, { number: '+17087106722', count: 1 }, { number: '+15098606661', count: 1 }, { number: '+12176496328', count: 1 }, { number: '+17036063514', count: 1 }, { number: '+14084638581', count: 1 } ], '15': [ { number: '+12066177563', count: 1832 }, { number: '+14256478071', count: 1741 }, { number: '+12069924635', count: 1298 }, { number: '+14259431562', count: 1155 }, { number: '+14257365590', count: 881 }, { number: '', count: 362 }, { number: 'lucasung51@gmail.com', count: 286 }, { number: '+12066126652', count: 151 }, { number: '+14257492034', count: 138 }, { number: '+18589975324', count: 94 }, { number: '+14255030080', count: 92 }, { number: '+12063938290', count: 90 }, { number: 'allisonyc@me.com', count: 64 }, { number: '+12243300417', count: 63 }, { number: '+16307797164', count: 62 }, { number: 'jeruntrajko@att.net', count: 54 }, { number: 'chrischris292@yahoo.com', count: 53 }, { number: '+14082282190', count: 38 }, { number: '+18477142528', count: 36 }, { number: '+18473739392', count: 29 }, { number: '+14252334939', count: 27 }, { number: '+18479151353', count: 27 }, { number: 'cbchan2@illinois.edu', count: 25 }, { number: 'wilbertthelam@gmail.com', count: 20 }, { number: '+17608156895', count: 18 }, { number: '+16309651029', count: 16 }, { number: '+14256814569', count: 14 }, { number: '+16145303707', count: 14 }, { number: '+17088288820', count: 13 }, { number: '+14254433622', count: 13 }, { number: '+18477560205', count: 11 }, { number: '+16309564601', count: 11 }, { number: '+12178191353', count: 11 }, { number: '+14257614249', count: 10 }, { number: '+12062805027', count: 9 }, { number: '+17323187818', count: 9 }, { number: '+17739900729', count: 9 }, { number: '+19085109351', count: 8 }, { number: '+14252478387', count: 8 }, { number: '+14252468510', count: 8 }, { number: '+13125938069', count: 7 }, { number: '+17739910996', count: 7 }, { number: '+12066975398', count: 7 }, { number: '+13127190168', count: 6 }, { number: '+17036063514', count: 5 }, { number: '+14088888756', count: 5 }, { number: '+12102684984', count: 4 }, { number: 'ly.yongmin@gmail.com', count: 4 }, { number: '+18472041937', count: 4 }, { number: '+18479973472', count: 4 }, { number: '+18722263155', count: 4 }, { number: '+14252466726', count: 4 }, { number: '+16189674415', count: 3 }, { number: '+13035027441', count: 3 }, { number: '+17146092963', count: 3 }, { number: '+18477145734', count: 3 }, { number: '+16304566401', count: 3 }, { number: '+14084638581', count: 3 }, { number: '+12247174056', count: 2 }, { number: '242733', count: 2 }, { number: '+15098606661', count: 2 }, { number: '+12067887868', count: 2 }, { number: 'monicay1@comcast.net', count: 2 }, { number: '+14256910798', count: 2 }, { number: '+12245954942', count: 2 }, { number: '+14252731303', count: 2 }, { number: '+15037307807', count: 2 }, { number: '+16264000017', count: 2 }, { number: 'allison-chan@live.com', count: 1 }, { number: '28888', count: 1 }, { number: '+18653606565', count: 1 }, { number: '+12243742619', count: 1 }, { number: '+13125936258', count: 1 }, { number: '+16189748702', count: 1 }, { number: '+17087106722', count: 1 }, { number: '1210100001', count: 1 }, { number: '+12063076030', count: 1 }, { number: '+14047238295', count: 1 }, { number: '+12245156002', count: 1 }, { number: '+12246224771', count: 1 }, { number: '+14257368921', count: 1 }, { number: '+12245229561', count: 1 }, { number: '+16305894946', count: 1 }, { number: '+12179792994', count: 1 }, { number: '+13125207019', count: 1 }, { number: '+12177213259', count: 1 }, { number: '+12069635847', count: 1 } ], '16': [ { number: '+12066177563', count: 1293 }, { number: '+14256478071', count: 1231 }, { number: '+12069924635', count: 989 }, { number: '+14259431562', count: 888 }, { number: '+14257365590', count: 639 }, { number: 'lucasung51@gmail.com', count: 305 }, { number: '', count: 302 }, { number: '+14257492034', count: 290 }, { number: '+12066126652', count: 257 }, { number: 'chrischris292@yahoo.com', count: 93 }, { number: '+18589975324', count: 89 }, { number: '+14252334939', count: 71 }, { number: 'jeruntrajko@att.net', count: 67 }, { number: '+14255030080', count: 61 }, { number: '+12063938290', count: 60 }, { number: '+16309651029', count: 56 }, { number: '+12243300417', count: 41 }, { number: '+16145303707', count: 40 }, { number: '+17608156895', count: 37 }, { number: '+14256814569', count: 36 }, { number: '+16307797164', count: 34 }, { number: '+18473739392', count: 23 }, { number: '+14082282190', count: 15 }, { number: '+18479151353', count: 13 }, { number: '+18477142528', count: 13 }, { number: '+17323187818', count: 11 }, { number: '+14254433622', count: 10 }, { number: '+18477560205', count: 10 }, { number: '+12245229561', count: 8 }, { number: '+17739900729', count: 8 }, { number: 'cbchan2@illinois.edu', count: 7 }, { number: '+14252478387', count: 7 }, { number: '+16309564601', count: 5 }, { number: '+12178191353', count: 5 }, { number: '+15037307807', count: 5 }, { number: '+12066975398', count: 5 }, { number: '+17088288820', count: 4 }, { number: '+13125938069', count: 3 }, { number: '+12245954942', count: 3 }, { number: 'wilbertthelam@gmail.com', count: 3 }, { number: '+14088888756', count: 3 }, { number: '+12067887868', count: 2 }, { number: '+17146092963', count: 2 }, { number: '+12066979202', count: 2 }, { number: '+14257614249', count: 2 }, { number: '+16264000017', count: 2 }, { number: '+13125207019', count: 2 }, { number: '+14256910798', count: 2 }, { number: '+18477145734', count: 2 }, { number: '+12063849865', count: 2 }, { number: '+17036063514', count: 2 }, { number: '+16189674415', count: 2 }, { number: '+14257361986', count: 1 }, { number: 'monicay1@comcast.net', count: 1 }, { number: '+12063028721', count: 1 }, { number: '+12069635847', count: 1 }, { number: '+14259990718', count: 1 }, { number: '+14252465664', count: 1 }, { number: '+16505213868', count: 1 }, { number: '+18064764358', count: 1 }, { number: '+19085109351', count: 1 }, { number: '+12247174056', count: 1 }, { number: '+17739910996', count: 1 }, { number: '+14084638581', count: 1 }, { number: '+18473877849', count: 1 }, { number: '+12062805027', count: 1 }, { number: '+18722263155', count: 1 }, { number: '1210100002', count: 1 }, { number: '+18472041937', count: 1 }, { number: 'mitchelnicoll@springgivesu.com', count: 1 }, { number: '+18479973472', count: 1 }, { number: '+12243927925', count: 1 }, { number: '+14085696058', count: 1 }, { number: '+12102684984', count: 1 }, { number: '+12243743497', count: 1 }, { number: 'btchan@yahoo.com', count: 1 } ], '17': [ { number: '+14256478071', count: 1433 }, { number: '+12066177563', count: 1311 }, { number: '+12069924635', count: 1144 }, { number: '+14259431562', count: 767 }, { number: '+14257365590', count: 651 }, { number: 'lucasung51@gmail.com', count: 427 }, { number: '+12066126652', count: 257 }, { number: '', count: 251 }, { number: '+14257492034', count: 158 }, { number: '+14255030080', count: 70 }, { number: '+12063938290', count: 62 }, { number: '+14252334939', count: 61 }, { number: '+18589975324', count: 54 }, { number: 'chrischris292@yahoo.com', count: 52 }, { number: 'jeruntrajko@att.net', count: 48 }, { number: '+14256814569', count: 43 }, { number: '+14082282190', count: 42 }, { number: '+16307797164', count: 40 }, { number: '+18477142528', count: 39 }, { number: '+17608156895', count: 23 }, { number: '+16309651029', count: 19 }, { number: 'cbchan2@illinois.edu', count: 18 }, { number: 'wilbertthelam@gmail.com', count: 16 }, { number: '+18064764358', count: 15 }, { number: '+12066975398', count: 12 }, { number: '+16145303707', count: 12 }, { number: '+18473739392', count: 11 }, { number: '+12243300417', count: 10 }, { number: '+14257614249', count: 9 }, { number: '+18479151353', count: 8 }, { number: '+16309564601', count: 8 }, { number: '+14254433622', count: 7 }, { number: '+13125938069', count: 6 }, { number: '+17088288820', count: 6 }, { number: 'allisonyc@me.com', count: 6 }, { number: '+18477560205', count: 4 }, { number: '+17087106722', count: 4 }, { number: '+17323187818', count: 4 }, { number: '+17036063514', count: 3 }, { number: '+15037307807', count: 3 }, { number: '+18479973472', count: 3 }, { number: '+12245954942', count: 2 }, { number: '+14256910798', count: 2 }, { number: '+17739900729', count: 2 }, { number: '+13127190168', count: 2 }, { number: '+18473379815', count: 2 }, { number: '+18472041937', count: 2 }, { number: '+13607478459', count: 2 }, { number: '+14252478387', count: 1 }, { number: '+12245156002', count: 1 }, { number: '+14257863150', count: 1 }, { number: '+14254660172', count: 1 }, { number: 'monicay1@comcast.net', count: 1 }, { number: '+17085437455', count: 1 }, { number: '+12102684984', count: 1 }, { number: '+16189674415', count: 1 }, { number: '+16189748702', count: 1 }, { number: '+12062805027', count: 1 }, { number: '+16264000017', count: 1 }, { number: '+12178191353', count: 1 }, { number: '+18477145734', count: 1 }, { number: '+18722263155', count: 1 }, { number: '35922', count: 1 }, { number: '+12179792994', count: 1 } ], '18': [ { number: '+12066177563', count: 1942 }, { number: '+14256478071', count: 1660 }, { number: '+12069924635', count: 1406 }, { number: '+14257365590', count: 1027 }, { number: '+14259431562', count: 906 }, { number: '', count: 276 }, { number: 'lucasung51@gmail.com', count: 216 }, { number: '+12066126652', count: 191 }, { number: '+14252334939', count: 183 }, { number: '+14257492034', count: 169 }, { number: '+14255030080', count: 102 }, { number: '+18589975324', count: 93 }, { number: '+12063938290', count: 67 }, { number: '+12062805027', count: 46 }, { number: 'jeruntrajko@att.net', count: 45 }, { number: '+18473739392', count: 28 }, { number: 'chrischris292@yahoo.com', count: 27 }, { number: 'allisonyc@me.com', count: 25 }, { number: '+16309651029', count: 25 }, { number: '+16145303707', count: 22 }, { number: '+14082282190', count: 20 }, { number: 'cbchan2@illinois.edu', count: 20 }, { number: '+17608156895', count: 18 }, { number: '+18477142528', count: 18 }, { number: '+16307797164', count: 17 }, { number: '+12066975398', count: 17 }, { number: '+14256814569', count: 16 }, { number: 'wilbertthelam@gmail.com', count: 12 }, { number: '+14256910798', count: 11 }, { number: '+17087106722', count: 9 }, { number: '+17739910996', count: 9 }, { number: '+12245954942', count: 8 }, { number: '+13125938069', count: 8 }, { number: '+14254433622', count: 8 }, { number: '+14252478387', count: 7 }, { number: '+12179792994', count: 7 }, { number: '+12243300417', count: 7 }, { number: '+18477560205', count: 7 }, { number: '+15037307807', count: 6 }, { number: '+14257614249', count: 5 }, { number: '+16189674415', count: 5 }, { number: '+17323187818', count: 5 }, { number: '+16309564601', count: 5 }, { number: '+14252468510', count: 4 }, { number: '+18479151353', count: 4 }, { number: '+18472041937', count: 4 }, { number: '+18479973472', count: 3 }, { number: '+12247174056', count: 3 }, { number: '+14088888756', count: 3 }, { number: '+16264000017', count: 3 }, { number: '+12178191353', count: 2 }, { number: '7535', count: 2 }, { number: '32665', count: 2 }, { number: '+18064764358', count: 2 }, { number: '+13127190168', count: 2 }, { number: '+17739900729', count: 1 }, { number: 'kmcelligott2016@gmail.com', count: 1 }, { number: '+18722263155', count: 1 }, { number: '+12243743497', count: 1 }, { number: '+17088288820', count: 1 }, { number: '+14254455808', count: 1 }, { number: '+18184470638', count: 1 }, { number: '+12063714530', count: 1 }, { number: '+14257496071', count: 1 }, { number: '+14253197484', count: 1 }, { number: 'lucas.ung@icloud.com', count: 1 }, { number: '+16094336237', count: 1 }, { number: '+14084638581', count: 1 }, { number: '+14252465664', count: 1 }, { number: '+12102684984', count: 1 } ], '19': [ { number: '+14256478071', count: 1572 }, { number: '+12066177563', count: 1393 }, { number: '+12069924635', count: 1143 }, { number: '+14257365590', count: 853 }, { number: '+14259431562', count: 712 }, { number: 'lucasung51@gmail.com', count: 383 }, { number: '', count: 259 }, { number: '+14257492034', count: 246 }, { number: '+12066126652', count: 213 }, { number: '+18589975324', count: 118 }, { number: '+14252334939', count: 101 }, { number: '+14255030080', count: 81 }, { number: 'jeruntrajko@att.net', count: 53 }, { number: '+12063938290', count: 53 }, { number: '+14256814569', count: 34 }, { number: 'chrischris292@yahoo.com', count: 30 }, { number: 'allisonyc@me.com', count: 30 }, { number: '+18473739392', count: 30 }, { number: '+17608156895', count: 23 }, { number: '+18477142528', count: 23 }, { number: 'cbchan2@illinois.edu', count: 22 }, { number: '+16145303707', count: 18 }, { number: '+14082282190', count: 17 }, { number: '+16307797164', count: 16 }, { number: '+12062805027', count: 15 }, { number: 'wilbertthelam@gmail.com', count: 13 }, { number: '+18479151353', count: 13 }, { number: '+13125938069', count: 12 }, { number: '+18477560205', count: 11 }, { number: '+12179792994', count: 10 }, { number: '+14254433622', count: 10 }, { number: '+14252478387', count: 7 }, { number: '+16309651029', count: 7 }, { number: '+14257614249', count: 6 }, { number: '+18477145734', count: 6 }, { number: '+17088288820', count: 5 }, { number: '+12178191353', count: 5 }, { number: '+17087106722', count: 5 }, { number: '+17739910996', count: 5 }, { number: 'monicay1@comcast.net', count: 4 }, { number: '+12247174056', count: 4 }, { number: '+12066975398', count: 4 }, { number: '+12243300417', count: 4 }, { number: '+17739900729', count: 3 }, { number: '+16466063820', count: 3 }, { number: '+13127190168', count: 3 }, { number: '+12243742619', count: 2 }, { number: '+14256910798', count: 2 }, { number: '+17323187818', count: 2 }, { number: '+16309564601', count: 2 }, { number: '+12243743497', count: 1 }, { number: '+14259546469', count: 1 }, { number: 'allison-chan@live.com', count: 1 }, { number: '+18479973472', count: 1 }, { number: '+18473379815', count: 1 }, { number: '242733', count: 1 }, { number: '1410000010', count: 1 }, { number: '+18478401206', count: 1 }, { number: '1410000011', count: 1 }, { number: '+18472041937', count: 1 }, { number: '70389', count: 1 }, { number: '+14252468510', count: 1 }, { number: '+12102684984', count: 1 }, { number: '+14157234000', count: 1 }, { number: '+16505427016', count: 1 }, { number: '+12245229561', count: 1 }, { number: '+14084638581', count: 1 } ], '20': [ { number: '+14256478071', count: 1989 }, { number: '+12066177563', count: 1310 }, { number: '+12069924635', count: 1047 }, { number: '+14257365590', count: 893 }, { number: 'lucasung51@gmail.com', count: 767 }, { number: '+14259431562', count: 728 }, { number: '+14257492034', count: 349 }, { number: 'chrischris292@yahoo.com', count: 305 }, { number: '+12066126652', count: 279 }, { number: '', count: 270 }, { number: '+18589975324', count: 114 }, { number: '+14255030080', count: 84 }, { number: '+14252334939', count: 51 }, { number: '+12063938290', count: 47 }, { number: 'cbchan2@illinois.edu', count: 43 }, { number: '+16307797164', count: 34 }, { number: '+14256814569', count: 33 }, { number: 'allisonyc@me.com', count: 32 }, { number: 'jeruntrajko@att.net', count: 23 }, { number: '+18477142528', count: 22 }, { number: 'allison-chan@live.com', count: 20 }, { number: '+18473739392', count: 19 }, { number: '+12062805027', count: 17 }, { number: '+12243300417', count: 12 }, { number: '+14082282190', count: 11 }, { number: '+17608156895', count: 11 }, { number: '+18477560205', count: 10 }, { number: '+14252478387', count: 9 }, { number: '+12066975398', count: 9 }, { number: '+16309564601', count: 8 }, { number: '+16309651029', count: 7 }, { number: '+12247174056', count: 7 }, { number: '+16145303707', count: 6 }, { number: 'wilbertthelam@gmail.com', count: 6 }, { number: '+14256910798', count: 6 }, { number: '+18479151353', count: 6 }, { number: '+18722263155', count: 5 }, { number: '+12245954942', count: 5 }, { number: '+13035027441', count: 4 }, { number: '+13127190168', count: 4 }, { number: '+14254433622', count: 4 }, { number: '+14047238295', count: 3 }, { number: '+12178191353', count: 3 }, { number: '+17036063514', count: 3 }, { number: '+16264000017', count: 2 }, { number: '+12174185537', count: 2 }, { number: '+14257368921', count: 2 }, { number: '+17087106722', count: 2 }, { number: '+18472041937', count: 2 }, { number: '+17323187818', count: 2 }, { number: '+13125938069', count: 2 }, { number: '7535', count: 2 }, { number: '+12102684984', count: 2 }, { number: '+14257614249', count: 2 }, { number: '1210100003', count: 1 }, { number: '+16304566401', count: 1 }, { number: '+17739910996', count: 1 }, { number: '+14259990718', count: 1 }, { number: '+12063714530', count: 1 }, { number: '+17088288820', count: 1 }, { number: 'monicay1@comcast.net', count: 1 }, { number: '64553', count: 1 }, { number: '+16505213868', count: 1 }, { number: '+12243743497', count: 1 }, { number: '+14252468510', count: 1 }, { number: '+16502833019', count: 1 } ], '21': [ { number: '+14256478071', count: 2369 }, { number: '+12066177563', count: 1017 }, { number: '+12069924635', count: 969 }, { number: '+14259431562', count: 871 }, { number: '+14257365590', count: 751 }, { number: 'lucasung51@gmail.com', count: 672 }, { number: '', count: 295 }, { number: '+14257492034', count: 216 }, { number: '+14252334939', count: 211 }, { number: '+12066126652', count: 207 }, { number: 'chrischris292@yahoo.com', count: 166 }, { number: '+14255030080', count: 132 }, { number: '+12063938290', count: 95 }, { number: '+18589975324', count: 93 }, { number: 'cbchan2@illinois.edu', count: 35 }, { number: 'jeruntrajko@att.net', count: 32 }, { number: 'allisonyc@me.com', count: 28 }, { number: 'wilbertthelam@gmail.com', count: 25 }, { number: '+17608156895', count: 24 }, { number: 'allison-chan@live.com', count: 22 }, { number: '+18477142528', count: 18 }, { number: '+12062805027', count: 18 }, { number: '+14082282190', count: 15 }, { number: '+16307797164', count: 15 }, { number: '+14254433622', count: 15 }, { number: '+16145303707', count: 14 }, { number: '+18477560205', count: 14 }, { number: '+18479151353', count: 12 }, { number: '+12243300417', count: 12 }, { number: '+16309564601', count: 11 }, { number: '+14256814569', count: 10 }, { number: '+13125938069', count: 10 }, { number: '+13607729413', count: 9 }, { number: '+14256910798', count: 9 }, { number: '+18477145734', count: 6 }, { number: 'monicay1@comcast.net', count: 4 }, { number: '+12066975398', count: 4 }, { number: '+18479973472', count: 4 }, { number: '+12066979202', count: 4 }, { number: 'kmcelligott2016@gmail.com', count: 3 }, { number: '+14257614249', count: 3 }, { number: '+12245954942', count: 3 }, { number: '+16309651029', count: 3 }, { number: '43895', count: 2 }, { number: '+18064764358', count: 2 }, { number: '+17088288820', count: 2 }, { number: '+17323187818', count: 2 }, { number: '+18473739392', count: 2 }, { number: '+15107893080', count: 1 }, { number: '+14258294811', count: 1 }, { number: '95686', count: 1 }, { number: 'jilldionne@comcast.net', count: 1 }, { number: '+12062186797', count: 1 }, { number: '35922', count: 1 }, { number: '64553', count: 1 }, { number: '+17739910996', count: 1 } ], '22': [ { number: '+14256478071', count: 1491 }, { number: '+12066177563', count: 1108 }, { number: '+12069924635', count: 798 }, { number: '+14259431562', count: 796 }, { number: '+14257365590', count: 684 }, { number: 'lucasung51@gmail.com', count: 622 }, { number: '+14257492034', count: 221 }, { number: 'cbchan2@illinois.edu', count: 214 }, { number: 'chrischris292@yahoo.com', count: 208 }, { number: '', count: 137 }, { number: '+12063938290', count: 111 }, { number: '+14255030080', count: 88 }, { number: 'allisonyc@me.com', count: 78 }, { number: '+12066126652', count: 68 }, { number: '+14252334939', count: 62 }, { number: '+14082282190', count: 37 }, { number: '+18589975324', count: 37 }, { number: '+14256814569', count: 22 }, { number: '+16145303707', count: 18 }, { number: '+18477142528', count: 16 }, { number: 'wilbertthelam@gmail.com', count: 14 }, { number: '+15107893080', count: 14 }, { number: '+16309651029', count: 13 }, { number: 'jeruntrajko@att.net', count: 11 }, { number: 'allison-chan@live.com', count: 9 }, { number: '+13125938069', count: 7 }, { number: '+13607729413', count: 5 }, { number: '+18477560205', count: 5 }, { number: '+16309564601', count: 4 }, { number: '+18473739392', count: 4 }, { number: '+17734705772', count: 4 }, { number: '+16307797164', count: 4 }, { number: '+17608156895', count: 3 }, { number: '+17323187818', count: 3 }, { number: '+17088288820', count: 3 }, { number: '+13035027441', count: 3 }, { number: '+12178191353', count: 2 }, { number: '+12243300417', count: 2 }, { number: '+13127190168', count: 2 }, { number: '+17087106722', count: 2 }, { number: '+14256910798', count: 2 }, { number: '+12063028721', count: 2 }, { number: '+1121611611', count: 2 }, { number: '+14259197523', count: 2 }, { number: '+14254574407', count: 2 }, { number: '+12063849865', count: 1 }, { number: '+14253066100', count: 1 }, { number: '+12069313273', count: 1 }, { number: '+12063714530', count: 1 }, { number: '+14258022402', count: 1 }, { number: '7535', count: 1 }, { number: '+18064764358', count: 1 }, { number: 'kmcelligott2016@gmail.com', count: 1 }, { number: '+14259990718', count: 1 }, { number: '55863', count: 1 }, { number: '+14257361986', count: 1 }, { number: '+14255035403', count: 1 }, { number: '+12062805027', count: 1 }, { number: '+14254433622', count: 1 }, { number: '+18477145734', count: 1 }, { number: '+16505213868', count: 1 }, { number: '+14085696058', count: 1 } ], '23': [ { number: '+12066177563', count: 978 }, { number: '+14256478071', count: 889 }, { number: '+12069924635', count: 830 }, { number: '+14257365590', count: 680 }, { number: '+14259431562', count: 600 }, { number: 'lucasung51@gmail.com', count: 148 }, { number: '+14257492034', count: 115 }, { number: '+14252334939', count: 80 }, { number: '', count: 76 }, { number: '+12066126652', count: 74 }, { number: '+12063938290', count: 69 }, { number: 'cbchan2@illinois.edu', count: 68 }, { number: '+18589975324', count: 29 }, { number: '+14082282190', count: 23 }, { number: '+14255030080', count: 22 }, { number: 'chrischris292@yahoo.com', count: 20 }, { number: 'wilbertthelam@gmail.com', count: 9 }, { number: '+17036063514', count: 8 }, { number: '+16307797164', count: 7 }, { number: '+18477142528', count: 5 }, { number: '+14257614249', count: 4 }, { number: '+16309564601', count: 3 }, { number: '+14254433622', count: 2 }, { number: '+17087106722', count: 2 }, { number: '+12243300417', count: 2 }, { number: '+18477145734', count: 2 }, { number: 'ly.yongmin@gmail.com', count: 2 }, { number: 'allisonyc@me.com', count: 1 }, { number: '+14256910798', count: 1 }, { number: '+12066975398', count: 1 }, { number: '+12102684984', count: 1 }, { number: '+14256814569', count: 1 }, { number: '+14259990718', count: 1 }, { number: '+18064764358', count: 1 }, { number: '+13125938069', count: 1 }, { number: '+18473739392', count: 1 }, { number: '+12066979202', count: 1 }, { number: '+14252478387', count: 1 }, { number: '+17734705772', count: 1 }, { number: '+14157234000', count: 1 }, { number: 'allison-chan@live.com', count: 1 }, { number: 'jeruntrajko@att.net', count: 1 } ] } 
//messageString for natural language parsing.*/
var 	mostFrequentWordsName = [];
var messageString = ""
var csvStream = csv()
    .on("data", function(data){
    	//messageData.push(data);
    	//setUpMispelledWords(data);
    	//setUpFrequentWords(data);
    	//setUpFrequentWordsNames(data);
    })
    .on("end", function(){
    	//sortMessages();
    	//sortFrequentWords();
        //createSubTitle(messageData)
        //findMostFrequentName();
       // mostFrequentAtTime();
        //sentimentAtTimes();
        //console.log(mostFrequentWordsName)

    });

stream.pipe(csvStream);
function sentimentAtTimes(){
	var sentimentData= {};
	var maxSentimentScores = [];
	//aggregate total
	for(i in messageData)
	{
		var message = messageData[i];
		if(message[0]=="+12064847887") //only want to count my own number
		{		
			var hour = moment(message[1],"MMM DD, YYYY, HH:mm:ss a").hour()
			hour = parseInt(hour);
			if(sentimentData[hour]==undefined)
			{
				var tempTuple = new tuple;
				tempTuple.count = 1;
				tempTuple.sentiment = sentiment(message[3]).score;
				sentimentData[hour] = tempTuple;
			}
			else
			{
				sentimentData[hour].sentiment += sentiment(message[3]).score
				sentimentData[hour].count ++;
			}
			if(sentiment(message[3]).score>8 || sentiment(message[3]).score<-8)
				maxSentimentScores.push(message[3])
		}

	}
	//average
	for(i = 0;i<24;i++){
		sentimentData[i].sentiment = sentimentData[i].sentiment/sentimentData[i].count;
	}
	console.log(sentimentData);
}
function sentimentTuple(){
	this.count;
	this.sentiment;
}
function tuple(){
	this.number;
	this.count;
}
function mostFrequentAtTime(){
	var timeDataStructure= {};
	for(i in messageData)
	{
		var message = messageData[i];
		if(message[0]!="+12064847887") //dont want to count my own number
		{		
			var hour = moment(message[1],"MMM DD, YYYY, HH:mm:ss a").hour()
			hour = parseInt(hour)
			if(timeDataStructure[hour]==undefined)
			{
				var obj = new tuple;
				obj.number = message[0];
				obj.count = 1;
				timeDataStructure[hour] = [obj]
			}
			else //hour is filled.
			{
				//check if number exists
				var hasNumber = false;
				var objTemp = timeDataStructure[hour];
				for(y = 0;y<objTemp.length;y++)
				{
					var tupleTemp = timeDataStructure[hour][y]; //number/count
					if(tupleTemp.number == message[0])
					{
						hasNumber = true; //if the number is alreadyd there add count it. 
						tupleTemp.count++;
						timeDataStructure[hour][y] = tupleTemp;
					}
				}

				//if number doesnt exist add number to time data structure. 
				if(!hasNumber) 
				{
					var obj = new tuple;
					obj.number = message[0];
					obj.count = 1;

					timeDataStructure[hour].push(obj)
				}
		}
	}
	}
	//console.log(timeDataStructure)\
	sortTimeDataStructure(timeDataStructure)
		console.log(timeDataStructure)

}

function sortTimeDataStructure(timeDataStructure){
	for(i = 1;i<24;i++){
		if(timeDataStructure[i]!=undefined)
		{
				timeDataStructure[i].sort(function(a,b){
					return b.count - a.count
				})
		}
	}
}
function createSubTitle(messages){
	var startYear = moment(messages[1][1],"MMM DD, YYYY, HH:mm:ss a").year()
	console.log(startYear)
	var endYear = moment(messages[messages.length-1][1],"MMM DD, YYYY, HH:mm:ss a").year();
	console.log(endYear)


	if(startYear==endYear)
	{}
}
function findMostFrequentName(){
	    arrayTemp = [];
    	console.log(mostFrequentWords["david"]); //146
    	console.log(mostFrequentWords["chris"]); //209
    	console.log(mostFrequentWords["wilbert"]); //182
    	console.log(mostFrequentWords["linsen"]); //352
}
function sortFrequentWords(){
	    arrayTemp = [];
    	for(word in mostFrequentWords)
    	{
    		console.log(word)
    		if(mostFrequentWords[word]>100)
    		{
    			arrayTemp.push([word,mostFrequentWords[word]]);
    		}
    		mostFrequentWords[word] = null;
    	}
    	mostFrequentWords = null;
    	console.log("createdArrayTemp")
		arrayTemp.sort(function(a,b){return b[1] - a[1]});
		for(i = 0;i<300;i++)
		{
			//console.log("sorted: " + arrayTemp[i]);
			mostFrequentWordsCache.push(arrayTemp[i])
		}
		console.log(mostFrequentWordsCache)
		mostFrequentWords = null;
}
function setUpFrequentWordsNames(data){

	    	if(data[3]!=undefined)
	    	{
	    		var string = ""
	    		for( i = 0;i<data[3].length;i++)
	    		{
	    			var character = data[3].charAt(i)
	    			if(character==" ")
	    			{
	    					if(string =="wilbert"||string=="david"||string=="chris"||string=="linsen"){
	    						if(mostFrequentWordsName[string]==undefined)
	    						{
		    						var tempTuple = new tuple();
		    						tempTuple.number = data[0];
		    						tempTuple.count = 1;
		    						mostFrequentWordsName[string] = [tempTuple];
	    						}
	    						else
	    						{
	    							var hasNumber = false;
	    							for(j = 0;j<mostFrequentWordsName[string].length;j++)
	    							{
		    							if(mostFrequentWordsName[string][j].number ==data[0]){
		    								mostFrequentWordsName[string][j].count++;
		    								hasNumber = true;
		    							}
		    							
		    						}
		    						if(hasNumber == false)
		    						{
		    							//console.log(data[0])
		    							var tempTuple = new tuple();
			    						tempTuple.number = data[0];
			    						tempTuple.count = 1;
			    						mostFrequentWordsName[string].push(tempTuple);
		    						}
	    						}
	    					}
							string = ""
					}

	    			else
	    			string = string + character;

	    		}
	    	}
}
function setUpFrequentWords(data){
	    	if(data[3]!=undefined)
	    	{
	    		var string = ""
	    		for( i = 0;i<data[3].length;i++)
	    		{
	    			var character = data[3].charAt(i)
	    			if(character==" ")
	    			{
							if(mostFrequentWords[string]==undefined)
							{
								mostFrequentWords[string] = 0;
							}
							else
							{
								mostFrequentWords[string]++;
							}
							string = ""
					}

	    			else
	    			string = string + character;

	    		}
	    	}
}
function setUpMispelledWords(data){
	messageData.push(data)
	    	if(data[3]!=undefined)
	    	{
	    		var string = ""
	    		for( i = 0;i<data[3].length;i++)
	    		{
	    			var character = data[3].charAt(i)
	    			if(character==" ")
	    			{
						if(SpellChecker.isMisspelled(string))
						{
							if(mispelledWords[string]==undefined)
							{
								mispelledWords[string] = 0;
							}
							else
								mispelledWords[string]++;
						}

	    				string = ""
	    			}
	    			else
	    			string = string + character;
	    		}

	    	}
}

function sortMessages(){
        arrayTemp = [];
    	for(word in mispelledWords)
    	{
    		arrayTemp.push([word,mispelledWords[word]]);
    	}
		arrayTemp.sort(function(a,b){return b[1] - a[1]});
		console.log("sorted: " + arrayTemp[0]);
		console.log("sorted: " + arrayTemp[1]);
		console.log("sorted: " + arrayTemp[2]);
		console.log("sorted: " + arrayTemp[3]);
		console.log("sorted: " + arrayTemp[4]);
		console.log("sorted: " + arrayTemp[5]);

}