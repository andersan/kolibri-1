<template>

  <li
    class="item-wrapper"
    :class="{ draggable }"
    :style="bgStyle"
  >
    <a
      tabindex="0"
      class="inner-link"
      :class="focusRing"
      @click="handleSelect"
      @keyup.enter.stop.prevent="handleSelect"
    >
      <span class="text">
        {{ text }}
        <KIcon
          v-if="!available"
          ref="missing"
          icon="warning"
          :style=" {
            fill: $themePalette.orange.v_400, float: isRtl ? 'left' : 'right'
          }"
        />
      </span>
      <CoachContentLabel
        class="coach-content-label"
        :value="isCoachContent ? 1 : 0"
        :isTopic="false"
      />
    </a>
    <KTooltip
      v-if="!available"
      reference="missing"
      placement="bottom"
      style="position: relative;"
      :refs="$refs"
    >
      {{ getMissingContentString('someResourcesMissingOrNotSupported') }}
    </KTooltip>
    <div v-if="draggable" class="handle">
      <DragSortWidget
        :isFirst="isFirst"
        :isLast="isLast"
        :moveUpText="$tr('moveExerciseUp')"
        :moveDownText="$tr('moveExerciseDown')"
        @moveDown="$emit('moveDown')"
        @moveUp="$emit('moveUp')"
      />
    </div>
  </li>

</template>


<script>

  import CoachContentLabel from 'kolibri.coreVue.components.CoachContentLabel';
  import DragSortWidget from 'kolibri.coreVue.components.DragSortWidget';
  import { coachStringsMixin } from '../../common/commonCoachStrings';

  export default {
    name: 'AssessmentQuestionListItem',
    components: {
      CoachContentLabel,
      DragSortWidget,
    },
    mixins: [coachStringsMixin],
    props: {
      draggable: {
        type: Boolean,
        required: true,
      },
      questionNumberOfExercise: {
        type: Number,
        default: null,
      },
      isSelected: {
        type: Boolean,
        required: true,
      },
      exerciseName: {
        type: String,
        required: true,
      },
      isCoachContent: {
        type: Boolean,
        required: true,
      },
      isFirst: {
        type: Boolean,
        default: false,
      },
      isLast: {
        type: Boolean,
        default: false,
      },
      available: {
        type: Boolean,
        required: true,
      },
    },
    computed: {
      text() {
        if (this.questionNumberOfExercise === undefined || this.questionNumberOfExercise === null) {
          return this.exerciseName;
        }
        return this.coachString('nthExerciseName', {
          name: this.exerciseName,
          number: this.questionNumberOfExercise,
        });
      },
      focusRing() {
        return this.$computedClass({ ':focus': this.$coreOutline });
      },
      bgStyle() {
        const color = this.isSelected ? this.$themePalette.grey.v_300 : this.$themeTokens.surface;
        return { backgroundColor: color };
      },
    },
    methods: {
      handleSelect() {
        this.$emit('select');
      },
    },
    $trs: {
      moveExerciseUp: {
        message: 'Move this exercise up by one position',
        context:
          'This is a screen reader option which refers to the option to reorder the way exercises are displayed to a learner.',
      },
      moveExerciseDown: {
        message: 'Move this exercise down by one position',
        context:
          'This is a screen reader option which refers to the option to reorder the way exercises are displayed to a learner.',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .item-wrapper {
    position: relative;
    left: -8px;
    display: block;
    width: 100%;
    padding: 8px;
    overflow: visible;
    text-align: left;
    white-space: nowrap;
    user-select: none;
    border-radius: 4px;
  }

  .inner-link {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .draggable {
    padding-right: 50px;
    padding-left: 8px;
    cursor: move; /* fallback if grab cursor is unsupported */
    cursor: grab;
  }

  .nowrap {
    white-space: nowrap;
  }

  .text {
    cursor: pointer;
  }

  .handle {
    position: absolute;
    top: 6px;
    right: 4px;
  }

  .hidden-buttons {
    display: none;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s;
  }

  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }

</style>
