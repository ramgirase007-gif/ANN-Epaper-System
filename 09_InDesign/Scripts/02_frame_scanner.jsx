/**
 * ANN Publisher v2.0 - Production Frame Scanner Module
 * Sprint 9 – Module 2 Production Build
 * 
 * Purpose:
 *   Comprehensive frame scanner for Adobe InDesign 2026.
 *   Scans all pages and returns ACTUAL InDesign PageItem object references.
 *   Detects TextFrame, Rectangle, Oval, Polygon, and Graphic objects.
 *   Reads script labels and builds a FrameMap with complete metadata.
 *   Handles grouped items and nested structures.
 * 
 * Compatibility:
 *   - Adobe InDesign 2026
 *   - ExtendScript (ES3) only
 *   - No modern JavaScript: no forEach, Object.keys, JSON.parse, Array.isArray
 * 
 * Core Data Structure (FrameMap):
 *   Each entry contains:
 *   {
 *       label: String,              // Script label from page item
 *       page: Number,               // Page number (1-indexed)
 *       pageName: String,           // Page name from InDesign
 *       bounds: Array,              // [y1, x1, y2, x2] in points
 *       type: String,               // Type: TextFrame, Rectangle, Oval, Polygon, Graphic
 *       layer: String,              // Layer name where item resides
 *       id: Number,                 // Unique frame identifier
 *       object: PageItem            // ACTUAL InDesign PageItem reference
 *   }
 * 
 * Public API:
 *   scanFrames()                    - Scan document and return FrameMap
 *   findFrame(label)                - Find single frame by exact label
 *   findFrames(prefix)              - Find all frames with label prefix
 * 
 * Usage:
 *   var frameMap = scanFrames();
 *   var logoFrame = findFrame("LOGO_1");
 *   var headlines = findFrames("HEADLINE_");
 */

/**
 * Global FrameMap storage
 * Populated by scanFrames() function
 * Contains array of frame objects with all metadata and PageItem references
 */
var g_FrameMap = [];

/**
 * Counter for generating unique frame IDs
 * Incremented for each frame detected during scan
 */
var g_FrameCounter = 0;

/**
 * Validates that a document is open and accessible
 * 
 * @return {boolean} - True if valid document exists
 */
function isDocumentOpen() {
    try {
        if (app.documents.length === 0) {
            return false;
        }
        var doc = app.activeDocument;
        if (!doc) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Retrieves the active document safely
 * 
 * @return {Document|null} - Active document or null if not available
 */
function getActiveDocument() {
    try {
        return app.activeDocument;
    } catch (e) {
        return null;
    }
}

/**
 * Determines the type of a page item using instanceof checks
 * CRITICAL: Uses instanceof, NOT constructor.name
 * 
 * Supported types:
 *   - TextFrame (text containers)
 *   - Rectangle (rectangular shapes)
 *   - Oval (circular/elliptical shapes)
 *   - Polygon (multi-sided shapes)
 *   - Graphic (images, placed files)
 * 
 * @param {PageItem} pageItem - Page item to examine
 * @return {string} - Type identifier or empty string if unsupported
 */
function getPageItemType(pageItem) {
    if (!pageItem) {
        return "";
    }
    
    try {
        // Check for TextFrame using instanceof
        if (pageItem instanceof TextFrame) {
            return "TextFrame";
        }
        
        // Check for Rectangle using instanceof
        if (pageItem instanceof Rectangle) {
            return "Rectangle";
        }
        
        // Check for Oval using instanceof
        if (pageItem instanceof Oval) {
            return "Oval";
        }
        
        // Check for Polygon using instanceof
        if (pageItem instanceof Polygon) {
            return "Polygon";
        }
        
        // Check for Graphic using instanceof
        if (pageItem instanceof Graphic) {
            return "Graphic";
        }
        
        // Unsupported type
        return "";
    } catch (e) {
        return "";
    }
}

/**
 * Reads the script label from a page item
 * Returns empty string if label is not set (item is skipped)
 * 
 * @param {PageItem} pageItem - Page item to read label from
 * @return {string} - Script label string, or empty string if not set
 */
function readScriptLabel(pageItem) {
    if (!pageItem) {
        return "";
    }
    
    try {
        if (pageItem.hasOwnProperty("label")) {
            var labelValue = pageItem.label;
            // Ensure it's a non-empty string
            if (labelValue && typeof labelValue === "string" && labelValue.length > 0) {
                return labelValue;
            }
        }
    } catch (e) {
        // Label property not accessible
    }
    
    return "";
}

/**
 * Gets the page name from a page object
 * 
 * @param {Page} page - Page object
 * @return {string} - Page name or empty string if not available
 */
function getPageName(page) {
    if (!page) {
        return "";
    }
    
    try {
        if (page.hasOwnProperty("name")) {
            var nameValue = page.name;
            if (nameValue && typeof nameValue === "string" && nameValue.length > 0) {
                return nameValue;
            }
        }
    } catch (e) {
        // Name not accessible
    }
    
    return "";
}

/**
 * Gets the layer name where a page item resides
 * 
 * @param {PageItem} pageItem - Page item to check
 * @return {string} - Layer name or empty string if not available
 */
function getLayerName(pageItem) {
    if (!pageItem) {
        return "";
    }
    
    try {
        if (pageItem.hasOwnProperty("itemLayer")) {
            var layer = pageItem.itemLayer;
            if (layer && layer.hasOwnProperty("name")) {
                var layerName = layer.name;
                if (layerName && typeof layerName === "string" && layerName.length > 0) {
                    return layerName;
                }
            }
        }
    } catch (e) {
        // Layer not accessible
    }
    
    return "";
}

/**
 * Extracts geometric bounds from a page item
 * Returns bounds in InDesign format [y1, x1, y2, x2]
 * 
 * @param {PageItem} pageItem - Page item to extract bounds from
 * @return {Array} - Bounds array [y1, x1, y2, x2]
 */
function extractBounds(pageItem) {
    if (!pageItem || !pageItem.hasOwnProperty("geometricBounds")) {
        return [0, 0, 0, 0];
    }
    
    try {
        var bounds = pageItem.geometricBounds;
        if (bounds && bounds.length === 4) {
            return [bounds[0], bounds[1], bounds[2], bounds[3]];
        }
    } catch (e) {
        // Bounds not accessible
    }
    
    return [0, 0, 0, 0];
}

/**
 * Processes a single page item
 * Creates frame entry only if:
 *   1. Item type is one of the supported types
 *   2. Item has a non-empty script label
 * 
 * Stores ACTUAL PageItem object reference in FrameMap
 * 
 * @param {PageItem} pageItem - Page item to process
 * @param {Page} page - Parent page object
 * @param {number} pageIndex - Zero-indexed page number
 * @return {void}
 */
function processPageItem(pageItem, page, pageIndex) {
    if (!pageItem || !page) {
        return;
    }
    
    // Detect item type using instanceof
    var itemType = getPageItemType(pageItem);
    
    // Skip if unsupported type
    if (itemType === "") {
        return;
    }
    
    // Read script label
    var label = readScriptLabel(pageItem);
    
    // Skip items with empty labels
    if (label === "") {
        return;
    }
    
    // Extract additional metadata
    var bounds = extractBounds(pageItem);
    var pageName = getPageName(page);
    var layerName = getLayerName(pageItem);
    
    // Create frame entry with ACTUAL PageItem reference
    var frameEntry = {
        label: label,                           // Script label
        page: pageIndex + 1,                    // 1-indexed page number
        pageName: pageName,                     // Page name from InDesign
        bounds: bounds,                         // Geometric bounds
        type: itemType,                         // Type from instanceof check
        layer: layerName,                       // Layer name
        id: g_FrameCounter,                     // Unique frame ID
        object: pageItem                        // ACTUAL InDesign PageItem reference
    };
    
    // Increment counter for next frame
    g_FrameCounter = g_FrameCounter + 1;
    
    // Add to FrameMap
    g_FrameMap.push(frameEntry);
}

/**
 * Recursively processes items within a group
 * Handles nested grouped items
 * 
 * @param {Group} groupItem - Group object containing items
 * @param {Page} page - Parent page object
 * @param {number} pageIndex - Zero-indexed page number
 * @return {void}
 */
function processGroupItems(groupItem, page, pageIndex) {
    if (!groupItem || !page) {
        return;
    }
    
    try {
        if (!groupItem.hasOwnProperty("pageItems")) {
            return;
        }
        
        var pageItems = groupItem.pageItems;
        
        if (!pageItems) {
            return;
        }
        
        // Iterate through all items in group (ES3 compatible)
        for (var i = 0; i < pageItems.length; i++) {
            var pageItem = pageItems[i];
            
            if (!pageItem) {
                continue;
            }
            
            // Check if this is a group
            try {
                if (pageItem instanceof Group) {
                    // Recursively process nested groups
                    processGroupItems(pageItem, page, pageIndex);
                    continue;
                }
            } catch (e) {
                // Not a group, process as normal item
            }
            
            // Process the item
            processPageItem(pageItem, page, pageIndex);
        }
    } catch (e) {
        // Error processing group items - continue
    }
}

/**
 * Processes all page items on a single page
 * Iterates through all items using traditional for loop (ES3)
 * Handles both top-level items and grouped items
 * 
 * @param {Page} page - Page object to scan
 * @param {number} pageIndex - Zero-indexed page number
 * @return {void}
 */
function processPage(page, pageIndex) {
    if (!page || !page.hasOwnProperty("pageItems")) {
        return;
    }
    
    try {
        var pageItems = page.pageItems;
        
        if (!pageItems) {
            return;
        }
        
        // Iterate through all page items (ES3 compatible)
        for (var i = 0; i < pageItems.length; i++) {
            var pageItem = pageItems[i];
            
            if (!pageItem) {
                continue;
            }
            
            // Check if this is a group
            try {
                if (pageItem instanceof Group) {
                    // Process items within the group
                    processGroupItems(pageItem, page, pageIndex);
                    continue;
                }
            } catch (e) {
                // Not a group, process as normal item
            }
            
            // Process the item
            processPageItem(pageItem, page, pageIndex);
        }
    } catch (e) {
        // Error processing page items - continue with next page
    }
}

/**
 * Main scanner function
 * Scans all pages in the active document
 * Builds comprehensive FrameMap with all detected frames
 * Resets global FrameMap before scanning
 * 
 * Process:
 *   1. Validates document is open
 *   2. Resets FrameMap and counter
 *   3. Iterates through all pages
 *   4. For each page, processes all page items (including grouped items)
 *   5. Returns complete FrameMap array
 * 
 * @return {Array} - FrameMap array with all detected frames and PageItem objects
 */
function scanFrames() {
    // Step 1: Validate document
    if (!isDocumentOpen()) {
        alert("Frame Scanner Error\n\nNo active document open.\n\nPlease open an InDesign document and try again.");
        return [];
    }
    
    var doc = getActiveDocument();
    if (!doc) {
        alert("Frame Scanner Error\n\nCannot access active document.\n\nPlease ensure the document is properly loaded.");
        return [];
    }
    
    // Step 2: Reset global state
    g_FrameMap = [];
    g_FrameCounter = 0;
    
    // Step 3: Validate pages exist
    if (!doc.hasOwnProperty("pages") || doc.pages.length === 0) {
        alert("Frame Scanner Error\n\nDocument contains no pages.\n\nPlease ensure the document has at least one page.");
        return [];
    }
    
    // Step 4: Iterate through pages (ES3 compatible)
    var pageCount = doc.pages.length;
    
    for (var pageIdx = 0; pageIdx < pageCount; pageIdx++) {
        try {
            var page = doc.pages[pageIdx];
            
            // Process all items on this page
            processPage(page, pageIdx);
        } catch (e) {
            // Continue with next page on error
        }
    }
    
    return g_FrameMap;
}

/**
 * Searches for a frame with exact label match
 * Returns first frame found with matching label
 * Frame object contains ACTUAL PageItem reference
 * 
 * @param {string} label - Exact label to search for
 * @return {Object|null} - Frame object with PageItem reference if found, null otherwise
 */
function findFrame(label) {
    if (!label || label === "") {
        return null;
    }
    
    // Ensure FrameMap is populated
    if (g_FrameMap.length === 0) {
        return null;
    }
    
    // Search for matching label (ES3 compatible)
    for (var i = 0; i < g_FrameMap.length; i++) {
        var frame = g_FrameMap[i];
        
        if (frame && frame.hasOwnProperty("label")) {
            if (frame.label === label) {
                return frame;
            }
        }
    }
    
    return null;
}

/**
 * Searches for all frames with label starting with prefix
 * Returns array of all matching frames
 * Useful for finding related frames (e.g., all "HEADLINE_" prefixed labels)
 * Each frame object contains ACTUAL PageItem reference
 * 
 * @param {string} prefix - Label prefix to search for
 * @return {Array} - Array of matching frame objects with PageItem references
 */
function findFrames(prefix) {
    if (!prefix || prefix === "") {
        return [];
    }
    
    // Ensure FrameMap is populated
    if (g_FrameMap.length === 0) {
        return [];
    }
    
    var results = [];
    var prefixLength = prefix.length;
    
    // Search for labels starting with prefix (ES3 compatible)
    for (var i = 0; i < g_FrameMap.length; i++) {
        var frame = g_FrameMap[i];
        
        if (frame && frame.hasOwnProperty("label")) {
            var frameLabel = frame.label;
            
            // Check if label starts with prefix
            if (frameLabel.length >= prefixLength) {
                // Use substr for ES3 compatibility
                var labelPrefix = frameLabel.substr(0, prefixLength);
                
                if (labelPrefix === prefix) {
                    results.push(frame);
                }
            }
        }
    }
    
    return results;
}

/**
 * ============================================================================
 * PUBLIC API EXPORT
 * ============================================================================
 * 
 * Public Functions:
 *   scanFrames()        - Scan document and build FrameMap with PageItem objects
 *   findFrame(label)    - Find single frame by exact label match
 *   findFrames(prefix)  - Find all frames with label starting with prefix
 * 
 * Global State (internal):
 *   g_FrameMap          - Current FrameMap array (populated by scanFrames)
 *   g_FrameCounter      - Frame ID counter
 * 
 * ============================================================================
 */
