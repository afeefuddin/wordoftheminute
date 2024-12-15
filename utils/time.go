package utils

import (
	"strconv"
	"time"
)

func PreviouseMinute(curr string) string {
	currTimestamp, err := strconv.ParseInt(curr, 10, 64)
	if err != nil {
		currTimestamp = time.Now().UTC().Truncate(time.Minute).Unix()
	}

	currentTime := time.Unix(currTimestamp, 0).UTC()

	previousMinute := currentTime.Add(-time.Minute)

	timestamp := previousMinute.Unix()

	return strconv.FormatInt(timestamp, 10)
}

func ThisMinute() string {
	now := time.Now().UTC()

	minute := now.Truncate(time.Minute)

	timestamp := minute.Unix()

	return strconv.FormatInt(timestamp, 10)
}

func NextSecond() int64 {
	now := time.Now().UTC()

	second := now.Truncate(time.Second).Add(time.Second)

	timestamp := second.Unix()

	return timestamp
}

func ThisSecond() int64 {
	now := time.Now().UTC()

	second := now.Truncate(time.Second)

	timestamp := second.Unix()

	return timestamp
}
