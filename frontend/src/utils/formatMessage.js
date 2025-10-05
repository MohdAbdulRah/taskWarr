export const formatMessage = (text) => {
    if (!text) return null;
  
    // Replace **bold** text with <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
    // Replace new lines with <br/>
    formatted = formatted.replace(/\n/g, "<br/>");
  
    return formatted;
  };
  