import pandas as pd
import json

url = "https://huggingface.co/datasets/newfacade/LeetCodeDataset/resolve/refs%2Fconvert%2Fparquet/default/train/0000.parquet"
print(f"Loading parquet from {url}...")
df = pd.read_parquet(url, columns=["task_id", "question_id", "input_output"])
print(f"Loaded {len(df)} problems!")
print("Sample row 0:")
print("task_id:", df.iloc[0]["task_id"])
io = df.iloc[0]["input_output"]
print("input_output type:", type(io))
print("First 3 test cases:")
for i in range(min(3, len(io))):
    print(f"  Case {i}:", io[i])
print(f"Total test cases for {df.iloc[0]['task_id']}:", len(io))
