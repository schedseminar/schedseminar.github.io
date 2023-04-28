from collections import defaultdict

keyword_counts = defaultdict(lambda: 0)

for line in open("README.md", "r", encoding="utf-8").readlines():
    if "<b>Keywords:</b>" in line:
        # Strip the text
        test = line.strip().replace("<br/>", "").replace("<br/>", "").replace("</b>", "")\
            .replace("<b>", "").replace("Keywords:", "").replace("<!--", "").replace("-->", "").split(",")
        for i in range(len(test)):
            test[i] = test[i].strip()

            # Add to dictionary
            keyword_counts[test[i]] += 1


sorted_dict = sorted(keyword_counts.items(), key=lambda x:x[1])
print(sorted_dict)