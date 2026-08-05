import json

def extract_and_parse_json(raw_content: str):
    raw_content = raw_content.strip()
    
    start_idx_list = raw_content.find('[')
    start_idx_dict = raw_content.find('{')
    
    valid_starts = [idx for idx in (start_idx_list, start_idx_dict) if idx != -1]
    start_idx = min(valid_starts) if valid_starts else -1
    
    end_idx_list = raw_content.rfind(']')
    end_idx_dict = raw_content.rfind('}')
    
    valid_ends = [idx for idx in (end_idx_list, end_idx_dict) if idx != -1]
    end_idx = max(valid_ends) if valid_ends else -1
    
    if start_idx != -1 and end_idx != -1 and end_idx >= start_idx:
        raw_content = raw_content[start_idx:end_idx+1]
        
    return json.loads(raw_content)
