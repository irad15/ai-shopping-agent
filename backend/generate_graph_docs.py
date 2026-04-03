import sys
import os

# To refresh the graph docs, run this from the backend directory:
# uv run python generate_graph_docs.py

# Ensure the backend directory is in the path so we can import the agent
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Mock the API key so the LLM object can initialize for visualization
if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = "sk-placeholder-for-visualization"

from agent.graph import graph

def generate_mermaid_docs():
    """
    Uses LangGraph's built-in visualization to generate a Mermaid diagram
    and saves it as a markdown file in the docs folder.
    """
    try:
        # 1. Generate the Mermaid diagram string from the compiled graph
        mermaid_code = graph.get_graph().draw_mermaid()
        
        # 2. Format it into a Markdown block
        markdown_content = f"# 🤖 Agent Logic Graph\n\nThis diagram is automatically generated from the LangGraph definition.\n\n```mermaid\n{mermaid_code}\n```\n"
        
        # 3. Ensure the docs directory exists
        docs_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "docs")
        os.makedirs(docs_path, exist_ok=True)
        
        # 4. Write to file
        output_file = os.path.join(docs_path, "agent_graph.md")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(markdown_content)
            
        print(f"✅ Success! Agent graph saved to: {output_file}")
        
    except Exception as e:
        print(f"❌ Error generating graph: {str(e)}")

if __name__ == "__main__":
    generate_mermaid_docs()
