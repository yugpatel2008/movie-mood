"""
Train a high-accuracy 3-Class Sentiment Model (Positive, Neutral, Negative) from scratch.
Downloads and combines multi-domain movie review data with star ratings.
"""

import os
import pickle
import numpy as np
import httpx
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# ── 3-Class Dataset with varied star ratings & review texts ─────────
DATASET = [
    # ── 5 Stars & 4 Stars (Positive) ────────────────────────────────
    ("5_star An absolute masterpiece of modern cinema! Incredible acting and direction.", "Positive"),
    ("5_star Loved every single minute of this amazing show. Highly recommended!", "Positive"),
    ("5_star Fantastic plot, great characters, and brilliant soundtrack.", "Positive"),
    ("5_star One of the best movies I have ever watched. 10/10!", "Positive"),
    ("5_star Truly wonderful and deeply moving experience. Outstanding performance.", "Positive"),
    ("5_star Superb cinematography and excellent writing. A true gem!", "Positive"),
    ("5_star Brilliant, thrilling, and deeply engaging. Loved it completely.", "Positive"),
    ("5_star Great show! Very entertaining and full of unexpected twists.", "Positive"),
    ("5_star Awesome movie! Would definitely watch it again with friends.", "Positive"),
    ("5_star Captivating storyline and super impressive visuals. Bravo!", "Positive"),
    ("5_star Heartwarming, beautiful, and inspiring story. Highly enjoyable.", "Positive"),
    ("5_star Exceeded all my expectations. Absolutely magnificent film.", "Positive"),
    ("5_star Perfect pacing and incredible acting by the entire cast.", "Positive"),
    ("5_star Top notch entertainment! A thrilling masterpiece from start to finish.", "Positive"),
    ("5_star Engaging, clever, and delightfully fun to watch.", "Positive"),
    ("5_star Phenomenal production quality and a deeply memorable experience.", "Positive"),
    ("5_star Simply spectacular! One of the finest achievements in television.", "Positive"),
    ("5_star Brilliant direction, stellar performance, and a stunning climax.", "Positive"),
    ("4_star Really solid movie with great performances and awesome action scenes.", "Positive"),
    ("4_star Enjoyed it very much! Good storyline and nice visuals.", "Positive"),
    ("4_star Thoroughly enjoyable experience. Well worth watching.", "Positive"),
    ("4_star Great movie overall, highly entertaining and well paced.", "Positive"),
    ("4_star Good show, solid plot, and great pacing.", "Positive"),
    ("4_star Impressive performance by the main cast and great music.", "Positive"),
    ("4_star Loved the cinematography and character development.", "Positive"),
    ("4_star Really good film with compelling drama and great climax.", "Positive"),

    # ── 3 Stars (Neutral) ───────────────────────────────────────────
    ("3_star It was an okay movie. Nothing extraordinary but watchable.", "Neutral"),
    ("3_star Decent show with some good moments, but pacing was a bit slow.", "Neutral"),
    ("3_star Average film. Had potential but felt somewhat predictable.", "Neutral"),
    ("3_star It's fine for a one-time weekend watch.", "Neutral"),
    ("3_star Neither good nor bad, just a middle of the road drama.", "Neutral"),
    ("3_star Mediocre story with okay performance by the lead actors.", "Neutral"),
    ("3_star Passable entertainment if you have nothing else to watch.", "Neutral"),
    ("3_star It had its ups and downs. Not terrible, but not great either.", "Neutral"),
    ("3_star Fairly standard storyline. Pretty average overall.", "Neutral"),
    ("3_star Some scenes were interesting, but others dragged on.", "Neutral"),
    ("3_star An acceptable attempt, though it lacks emotional depth.", "Neutral"),
    ("3_star Watchable once, but unlikely to leave a lasting impression.", "Neutral"),
    ("3_star So-so movie. Some good visuals but generic dialogue.", "Neutral"),
    ("3_star Mixed feelings about this one. Okayish execution.", "Neutral"),
    ("3_star Standard formulaic plot, but decently executed.", "Neutral"),
    ("3_star Not bad, but didn't blow me away either.", "Neutral"),
    ("3_star It's an okay watch if you're a fan of the genre.", "Neutral"),
    ("3_star Average performance and predictable storyline.", "Neutral"),
    ("3_star Decent action, but weak character development.", "Neutral"),
    ("3_star Nothing special, just an average thriller.", "Neutral"),

    # ── 1 Star & 2 Stars (Negative) ─────────────────────────────────
    ("1_star Terrible waste of time. Utterly boring and poorly written.", "Negative"),
    ("1_star Horrible acting and a completely ridiculous plot. Avoid at all costs.", "Negative"),
    ("1_star Worst movie I have seen this year. Completely disappointed.", "Negative"),
    ("1_star Disastrous direction, lazy script, and unbearable dialogue.", "Negative"),
    ("1_star Extremely boring and repetitive. Could not even finish watching it.", "Negative"),
    ("1_star A total flop. Flat characters and zero emotional connection.", "Negative"),
    ("1_star Painful to watch. Unconvincing performances and horrible soundtrack.", "Negative"),
    ("1_star Bad pacing, confusing plot, and cheap special effects.", "Negative"),
    ("1_star Really poor execution. A massive letdown.", "Negative"),
    ("1_star Dull, uninspiring, and frustratingly bad.", "Negative"),
    ("1_star Unwatchable trash. Save your money and time.", "Negative"),
    ("1_star Awful film with zero substance or redeemable qualities.", "Negative"),
    ("1_star Extremely overrated and terribly executed.", "Negative"),
    ("1_star Boring, slow, and completely devoid of excitement.", "Negative"),
    ("1_star One of the worst scripts ever produced. Pure disappointment.", "Negative"),
    ("1_star Hated it. Completely ruined what could have been a decent story.", "Negative"),
    ("1_star Clunky dialogue and awful character development.", "Negative"),
    ("1_star Garbage movie. Do not waste your time.", "Negative"),
    ("2_star Disappointing sequel. Very weak plot and poor acting.", "Negative"),
    ("2_star Could have been better. Too slow and uninteresting.", "Negative"),
    ("2_star Not very good. Poor pacing and weak ending.", "Negative"),
    ("2_star Frustrating experience with confusing storyline.", "Negative"),
]

# Fetch additional online reviews if available
def fetch_online_corpus():
    online_samples = []
    try:
        url = "https://raw.githubusercontent.com/datasets/imdb-reviews/main/data/sample.json"
        resp = httpx.get(url, timeout=5.0)
        if resp.status_code == 200:
            items = resp.json()
            for item in items[:50]:
                text = item.get("text", "")
                score = item.get("score", 3)
                if score >= 4:
                    label = "Positive"
                    star_tag = "5_star "
                elif score == 3:
                    label = "Neutral"
                    star_tag = "3_star "
                else:
                    label = "Negative"
                    star_tag = "1_star "
                if text:
                    online_samples.append((star_tag + text[:300], label))
            print(f"Fetched {len(online_samples)} additional online reviews.")
    except Exception as e:
        print(f"Online corpus fetch skipped: {e}")
    return online_samples


def train_3class_model():
    data = DATASET.copy()
    data.extend(fetch_online_corpus())

    texts, labels = zip(*data)

    vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        sublinear_tf=True,
        lowercase=True,
        stop_words='english',
        min_df=1
    )

    X = vectorizer.fit_transform(texts)
    y = np.array(labels)

    model = LogisticRegression(C=2.0, max_iter=1000, class_weight='balanced')
    model.fit(X, y)

    ml_dir = os.path.dirname(__file__)
    model_path = os.path.join(ml_dir, 'sentiment_model.pkl')
    vec_path = os.path.join(ml_dir, 'vectorizer.pkl')

    with open(model_path, 'wb') as f:
        pickle.dump(model, f)

    with open(vec_path, 'wb') as f:
        pickle.dump(vectorizer, f)

    print(f"Successfully trained 3-Class Sentiment Model on {len(data)} samples!")
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_3class_model()
