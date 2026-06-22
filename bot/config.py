import json
import os

CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_JSON_PATH = os.path.join(CONFIG_DIR, "config_bot.json")

# Default values from current config.py
DEFAULT_CONFIG = {
    "API_KEY": "api_key",
    "SECRET_KEY": "secret_key",
    "IMEISUP": "6a0d7216-371f-4020-a239-5b1417106780-8e253f85246590342756399a57054cb8",
    "COOKIESUP": {
        "__zi": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8Wwd-sXbqrRZ7-RwQRIJLg9S9hheZ0r.1",
        "__zi-legacy": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8Wwd-sXbqrRZ7-RwQRIJLg9S9hheZ0r.1",
        "_gcl_au": "1.1.2101141227.1769173139",
        "_fbp": "fb.1.1769173139672.477687215504911607",
        "_ga_NVN38N77J3": "GS2.2.s1769195417$o1$g1$t1769195428$j49$l0$h0",
        "_ga_907M127EPP": "GS2.1.s1769195183$o6$g1$t1769195606$j60$l0$h0",
        "_ga_E63JS7SPBL": "GS2.1.s1769195414$o4$g1$t1769195606$j60$l0$h0",
        "_ga": "GA1.2.675182245.1769070296",
        "_zlang": "vn",
        "_gid": "GA1.2.1604860776.1772012017",
        "_gat": "1",
        "_ga_3EM8ZPYYN3": "GS2.2.s1772012017$o4$g0$t1772012017$j60$l0$h0",
        "zpsid": "o_td.446059531.9.lajrXzJWYQhVj1-msE29gg6J-vxWrhcVxTMwczf2HASiKZl-rHz8DBtWYQe",
        "zpw_sek": "mkkS.446059531.a0.kWzlpXh6Hv0Haj6AEyP7a67a8liu_6NwIVS8-6o97zThfmgaAgatncgG3jfz-tgoPyZbNHS-zI9EnxXHXAz7a0",
        "app.event.zalo.me": "4028800846833120096"
    },
    "ACCOUNTS": [
        {
            "name": "Listener Zalo",
            "imei": "3f9f16d8-6963-423e-9e40-cc3d0cadcc9f-89db729cfcdc129111f017b0e7ac324a",
            "session_cookies": {
                "zoaw_sek": "Zdo2.1953754551.2.IDGEd3b0P0gEhHT-EK1a2Zb0P0evG6GAE4JrNL10P0e",
                "zoaw_type": "0",
                "_ga_907M127EPP": "GS2.1.s1767700586$o3$g1$t1767700984$j60$l0$h0",
                "_zlang": "vn",
                "_ga": "GA1.2.1918363637.1764479014",
                "_gid": "GA1.2.1192370665.1767893476",
                "_ga_3EM8ZPYYN3": "GS2.2.s1767893476$o14$g1$t1767893720$j57$l0$h0",
                "zpsid": "9D1H.414121782.18.UrN2xmlwLh0z1VYe1_fMi7w998GwpcU2EirkWdhjO8mq9-Os2XYyxsBwLh0",
                "zpw_sek": "tCFV.414121782.a0.1JHNpHMsIE0ZIURuDBP8u6wKBOitZ6g4Ozm3gsE5VxTTdMEDHuudrqpx2h5KYtN2QCTVrYc9bL2JjweAIjz8u0",
                "__zi": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8W_dUoccarHY7ARuw3LILUAU9phhpWr.1",
                "__zi-legacy": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8W_dUoccarHY7ARuw3LILUAU9phhpWr.1",
                "app.event.zalo.me": "791106021866069363"
            }
        },
        {
            "name": "Sender Zalo 1",
            "imei": "2f2ed622-06c4-4d83-95ca-5c2e21f35124-90daa551604269dbcdcf237b5cc700f3",
            "session_cookies": {
                "_zlang": "vn",
                "_ga": "GA1.2.1468077481.1780290708",
                "_gid": "GA1.2.1273769570.1780290708",
                "_ga_3EM8ZPYYN3": "GS2.2.s1780290708$o1$g0$t1780290708$j60$l0$h0",
                "zpsid": "PlxL.440762749.30.1tKgIj8YZsYleyfotYAFQATH_Lpc4hXUu1MxKQSd76aAZuj5qq-PTRWYZsW",
                "zpw_sek": "UrIA.440762749.a0.Gz7g0zIAYTof2yp6zOg9tA-exBVsiAkJv-tml-FayQsLtzg4k--zlxxCqvcLjxJ-gV-CJzLI9DZvY-JAoU29t0",
                "__zi": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8WwcUgYd4bRXtIVwQFGIbMETPNYeZSn.1",
                "__zi-legacy": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8WwcUgYd4bRXtIVwQFGIbMETPNYeZSn.1",
                "app.event.zalo.me": "4751117106338366310"
              }
        },
        {
            "name": "Sender Zalo 2",
            "imei": "6d6bc4ec-c2b3-43d7-a773-65fa21e73809-90daa551604269dbcdcf237b5cc700f3",
            "session_cookies": {
                "_zlang": "vn",
                "_ga": "GA1.2.1391734421.1780290689",
                "_gid": "GA1.2.1336024310.1780290689",
                "_ga_3EM8ZPYYN3": "GS2.2.s1780290689$o1$g0$t1780290689$j60$l0$h0",
                "zpsid": "z96d.442333133.17.KKHiAkwii-OZs-xyugopvflVmTBQde3LtPs0rPkf8ESs0RVBxmkb-uIii-O",
                "zpw_sek": "JRzS.442333133.a0.FE4UV0H2MHJ9DGGE9K9P57zWF7ycU7jXT3TfSq4A27nU3Jz1BmDXUsSt7s5LVsGsUJTSXmMQz10fG_u26IXP50",
                "__zi": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8Wwc-wddKrOY7MRwgpHJbQ1TvhggZ0t.1",
                "__zi-legacy": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8Wwc-wddKrOY7MRwgpHJbQ1TvhggZ0t.1",
                "app.event.zalo.me": "8143048870042852744"
              }
        },
        {
            "name": "Sender Zalo 3",
            "imei": "e1b3ae15-ab46-45ec-b497-744bf78a767a-7c73ef5b8d3235ae0606f2e84e457ff5",
            "session_cookies": {
                "_ga": "GA1.2.1134358560.1771595942",
                "ozi": "2000.QOBlzDCV2uGerkFzm0LMqMNMv_N625hGBjxe-uiCLD8csEZwCJ4.1",
                "_zlang": "vn",
                "_gid": "GA1.2.1822130869.1774451956",
                "_ga_3EM8ZPYYN3": "GS2.2.s1774451956$o2$g0$t1774451956$j60$l0$h0",
                "zpsid": "Ym2E.440765321.7.wbyQkkM9kCDi0ltPwOcumv3wolVHkO_rqBgAykjnTTQn3I_mvB1708o9kCC",
                "zpw_sek": "iTUN.440765321.a0.Kmv9CVj8fXvom-C4saYc7e1gmtNPSeH7eIwJP94kpqwP7-rkpp3CAOuRpKsCTPiyXaPUq-uS8ed8IPpXE26c7W",
                "__zi": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8WwcUgYcqrTZtERxwJJI5-ASfpYf34t.1",
                "__zi-legacy": "3000.SSZzejyD6zOgdh2mtnLQWYQN_RAG01ICFjIXe9fEM8WwcUgYcqrTZtERxwJJI5-ASfpYf34t.1",
                "app.event.zalo.me": "3847533501177200108"
              }
        }
    ],
    "PREFIX": "!",
    "ADMIN": "759907991254801453",
    "QWEN_API_KEY": "sk-1d5eb3bd8fb14a14b3a5ef3662416f03",
    "QWEN_API_URL": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
    "GITHUB_TOKENS": [
        "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",
        "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",
        "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"
    ],
    "GITHUB_API_URL": "https://models.inference.ai.azure.com/chat/completions",
    "GITHUB_MODELS": [
        "gpt-4o",
        "gpt-4o-mini",
        "gpt-4.1",
        "gpt-4.1-mini",
        "Llama-3.3-70B-Instruct",
        "Llama-3.1-405B-Instruct",
        "Llama-3.1-70B-Instruct",
        "Llama-3.1-8B-Instruct",
        "Llama-3.2-11B-Vision-Instruct",
        "Llama-3.2-90B-Vision-Instruct",
        "Mistral-large",
        "Mistral-small",
        "Mistral-Nemo",
        "Mixtral-8x7B-Instruct",
        "Mixtral-8x22B-Instruct",
        "Command-R",
        "Command-R-plus"
    ]
}

if not os.path.exists(CONFIG_JSON_PATH):
    with open(CONFIG_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(DEFAULT_CONFIG, f, ensure_ascii=False, indent=2)

with open(CONFIG_JSON_PATH, "r", encoding="utf-8") as f:
    config_data = json.load(f)

# Load variables
API_KEY = config_data.get("API_KEY", DEFAULT_CONFIG["API_KEY"])
SECRET_KEY = config_data.get("SECRET_KEY", DEFAULT_CONFIG["SECRET_KEY"])
IMEISUP = config_data.get("IMEISUP", DEFAULT_CONFIG["IMEISUP"])
COOKIESUP = config_data.get("COOKIESUP", DEFAULT_CONFIG["COOKIESUP"])
ACCOUNTS_RAW = config_data.get("ACCOUNTS", DEFAULT_CONFIG["ACCOUNTS"])

# Standardize ACCOUNTS to contain just imei and session_cookies (stripping name/metadata)
ACCOUNTS = []
for acc in ACCOUNTS_RAW:
    ACCOUNTS.append({
        "imei": acc.get("imei", ""),
        "session_cookies": acc.get("session_cookies", {})
    })

PREFIX = config_data.get("PREFIX", DEFAULT_CONFIG["PREFIX"])
ADMIN = config_data.get("ADMIN", DEFAULT_CONFIG["ADMIN"])
QWEN_API_KEY = config_data.get("QWEN_API_KEY", DEFAULT_CONFIG["QWEN_API_KEY"])
QWEN_API_URL = config_data.get("QWEN_API_URL", DEFAULT_CONFIG["QWEN_API_URL"])
GITHUB_TOKENS = config_data.get("GITHUB_TOKENS", DEFAULT_CONFIG["GITHUB_TOKENS"])
GITHUB_API_URL = config_data.get("GITHUB_API_URL", DEFAULT_CONFIG["GITHUB_API_URL"])
GITHUB_MODELS = config_data.get("GITHUB_MODELS", DEFAULT_CONFIG["GITHUB_MODELS"])

# Backwards compatibility for individually named account variables
IMEI1 = ACCOUNTS[0]["imei"] if len(ACCOUNTS) > 0 else ""
SESSION_COOKIES1 = ACCOUNTS[0]["session_cookies"] if len(ACCOUNTS) > 0 else {}
IMEI2 = ACCOUNTS[1]["imei"] if len(ACCOUNTS) > 1 else ""
SESSION_COOKIES2 = ACCOUNTS[1]["session_cookies"] if len(ACCOUNTS) > 1 else {}
IMEI3 = ACCOUNTS[2]["imei"] if len(ACCOUNTS) > 2 else ""
SESSION_COOKIES3 = ACCOUNTS[2]["session_cookies"] if len(ACCOUNTS) > 2 else {}
IMEI6 = ACCOUNTS[3]["imei"] if len(ACCOUNTS) > 3 else {}
SESSION_COOKIES6 = ACCOUNTS[3]["session_cookies"] if len(ACCOUNTS) > 3 else {}
