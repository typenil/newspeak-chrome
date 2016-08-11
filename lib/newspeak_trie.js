const MODIFIERS = {
    "0": "",
    "1": "plus",
    "2": "doubleplus",
};

const SUFFIXES = {
    "a": "ful",
    "r": "wise",
};

var WHITESPACE = {};
WHITESPACE[" ".charCodeAt(0)] = true;
WHITESPACE["\t".charCodeAt(0)] = true;
WHITESPACE["\n".charCodeAt(0)] = true;
WHITESPACE["\r".charCodeAt(0)] = true;

function isAlphanumeric(charCode) {
  if (charCode >= "A".charCodeAt(0) && charCode <= "Z".charCodeAt(0))
    return true;
  if (charCode >= "a".charCodeAt(0) && charCode <= "z".charCodeAt(0))
    return true;
  if (charCode >= "0".charCodeAt(0) && charCode <= "9".charCodeAt(0))
    return true;

  return false;
}

function isWhitespace(charCode) {
  return WHITESPACE[charCode] === true;
}

function isSpace(charCode) {
  return charCode === " ".charCodeAt(0);
}

// TODO: Convert to a more robust stemming API
function isStemEnd(word, index) {
    if (index >= word.length)
        return true;

    if (word.substring(index, index + 1) == "s" &&
            (word.length < index + 2 || !isAlphanumeric(word.charCodeAt(index + 1))))
        return true;
        
    if ((word.substring(index, index + 2) == "es" || word.substring(index, index + 2) == "ed") &&
            (word.length < index + 2 || !isAlphanumeric(word.charCodeAt(index + 1))))
        return true;
    
    return false;
}

function getDegreeMod(trobject) {
    if (!trobject.isModifier) return 0;

    if (trobject.isPositive) return trobject.degree;
    else return -trobject.degree;
};
      
function toString(trobject, degreeMod) {
    var degree = trobject.degree + (degreeMod || 0);
    if (degree < 0) degree = 0;
    if (degree > 2) degree = 2;
    
    var converted = [
        MODIFIERS[degree],
        trobject.isPositive ? "" : "un",
        trobject.new,
        SUFFIXES[trobject.type] || ""
    ];
    
    return converted.join("");
};

function NewspeakTrie(trie) {
    var self = this;

    // Allow use without 'new'
    if (!(this instanceof NewspeakTrie))
        return new NewspeakTrie(trie);

    self.trie = trie;
}

NewspeakTrie.prototype.getWordObj = function(word, offset) {
    var self = this;
    if (!word || word.length <= 0)
        return;
    
    var knownSolution = null;
    var trobject = self.trie;
    var index = offset;
    var charCode;
    var charLength;
    while(index < word.length) {
        charCode = word.charCodeAt(index);
        charLength = String.fromCharCode(charCode).length;
        
        if (!trobject.hasOwnProperty(charCode)) {
          if (trobject.orig && 
              (!isAlphanumeric(charCode) || isStemEnd(word, index)))
            return trobject;
          else
            return knownSolution;
        }
      
        if (trobject.orig && 
              (!isAlphanumeric(charCode) || isStemEnd(word, index)))
          knownSolution = trobject;
        
        trobject = trobject[charCode];
        index += charLength;
    }
    if (trobject.orig && 
            (!isAlphanumeric(charCode) || isStemEnd(word, index)))
        return trobject;

    return null;
}

NewspeakTrie.prototype.swapAllWords = function(origText) {
    var self = this;
    if (!origText || origText.length <= 0)
        return origText;
    
    var text = origText.toLowerCase();
    var swapped = [];
    var lastAdded = 0;
    var index = 0;
    var charCode;
    var prevCharCode;
    var charLength;
    var degree = 0;
    
    while(index < text.length) {
        charCode = text.charCodeAt(index);
        charLength = String.fromCharCode(charCode).length;
        
        var match = self.getWordObj(text, index);
        var clearNextSpace = false;
        
        if (match !== null) {
            if (match.new.length <= 0) {
                if (isSpace(prevCharCode) && match.clearLastSpace())
                    swapped.push(origText.substring(lastAdded, index - 1));
                else
                    clearNextSpace = true;
            } else
                swapped.push(origText.substring(lastAdded, index));
            
            
            index += match.orig.length;
            if (clearNextSpace && isSpace(text.charCodeAt(index))) index++;
            
            lastAdded = index;
            degree += getDegreeMod(match);
            
            if (!match.isModifier) {
                swapped.push(toString(match, degree));
                degree = 0;
            }
        } else {

            while (isAlphanumeric(charCode)) {
                index += charLength;

                if (index >= text.length) break;

                charCode = text.charCodeAt(index);
                charLength = String.fromCharCode(charCode).length;
            }

            index += charLength;
        }
        
        prevCharCode = charCode;
    }
    
    if (lastAdded < text.length)
        swapped.push(origText.substring(lastAdded, text.length));
    
    return swapped.join("");
}