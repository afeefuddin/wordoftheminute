package main

import (
	"context"
	"fmt"
	"strings"

	"github.com/afeefuddin/wordoftheminute/utils"
)

func listMessages() string {
	curMin := utils.ThisMinute()
	data, err := RedisClient.ZRevRangeWithScores(context.Background(), curMin, 0, -1).Result()

	if err != nil {
		return ""
	}

	op := []string{}

	for _, member := range data {

		op = append(op, fmt.Sprintf("%v#%v", member.Member, member.Score))
	}

	return strings.Join(op, ",")

}
