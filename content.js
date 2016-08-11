var trie = new NewspeakTrie(trie_data);

var replaceTextInNode = function(parentNode) {
    for(var i = parentNode.childNodes.length-1; i >= 0; i--) {
        var node = parentNode.childNodes[i];

        //  Make sure this is a text node
        if(node.nodeType == Element.TEXT_NODE) {
            node.textContent = trie.swapAllWords(node.textContent);
        } else {
            //  Check this node's child nodes for text nodes to act on
            replaceTextInNode(node);
        }
    }
};

replaceTextInNode(document.body);